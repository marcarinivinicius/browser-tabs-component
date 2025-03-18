import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild, ViewContainerRef,
} from '@angular/core';
import {TabComponent} from './components/tab/tab.component';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {DynamicTabsDirective} from './directives/dynamic-tabs.directive';
import {ScrollableContainerDirective} from './directives/scrollable-container.directive';
import {ActivatedRoute} from '@angular/router';
import {Subject, startWith, switchMap, takeUntil, of} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule, NgIf, NgTemplateOutlet} from '@angular/common';
import {DynamicComponentLoaderService} from "./services/dynamic-component-loader.service";
import {TabConfig} from "./models/tab-config";

@Component({
  selector: 'app-tabs-full',
  templateUrl: './tabs-full.component.html',
  styleUrls: ['./tabs-full.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    CdkDrag,
    CdkDropList,
    NgTemplateOutlet,
    DynamicTabsDirective,
    NgIf,
    CommonModule,
    ScrollableContainerDirective,
  ],
})
export class TabsFullComponent implements AfterViewInit, OnDestroy {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;

  @Input() darkMode = false;
  @Input() isDraggable = true;
  @Input() hasCloseableEmit = false;
  @Input() showAddTabButton = true;
  @Input() isScrollable = true;
  @Input() scrollUnit = 200;
  @Input() tabIndicator = false;
  @Input() tabIndicatorColor = 'var(--main-color)';
  @Input() tabIndicatorPosition: 'top' | 'bottom' = 'top';
  @Input() closeWithDoubleClick = false;
  @Input() isNameEditable = true;
  @Input() allCloseable = false;
  @Input() dragDropDisabled = false;

  @Output() tabNameChanged = new EventEmitter<TabComponent>();
  @Output() closeTabButton = new EventEmitter<TabComponent>();
  @Output() tabSelected = new EventEmitter<TabComponent>();
  @Output() addTabButtonClick = new EventEmitter<boolean>();
  @Output() closeTabWithDoubleClick = new EventEmitter<TabComponent>();
  @Output() iconClick = new EventEmitter<TabComponent>();

  @ViewChild(DynamicTabsDirective, { static: false }) private dynamicTabPlaceholder!: DynamicTabsDirective;
  @ViewChild('dynamicContainer', { read: ViewContainerRef, static: true }) private dynamicContainer!: ViewContainerRef;

  @ViewChild('scrollable') private scrollable!: ScrollableContainerDirective;

  @HostBinding('class.full-width') fullWidth = false;

  private destroy$ = new Subject<void>();
  private cloneDynamicInstance: TabComponent[] = [];

  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute, private dynamicLoader: DynamicComponentLoaderService) {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.dynamicTabPlaceholder?.viewContainer) {
        console.error('Erro: dynamicTabPlaceholder ainda não está disponível.');
      }
    });
  }

  selectTab(selectedTab: TabComponent): void {
    if (!selectedTab || selectedTab.active || selectedTab.disabled) return;

    this.tabs.forEach((tab) => (tab.active = false));

    selectedTab.active = true;
    this.tabSelected.emit(selectedTab);

    // Se for uma aba dinâmica, recarregar o componente correspondente
    if (selectedTab.isDynamicTab && this.dynamicContainer) {
      this.dynamicContainer.clear(); // Remove o componente anterior
      this.dynamicLoader.loadComponent(selectedTab.componentName, this.dynamicContainer, selectedTab);
    }

    this.scrollView();
    this.cdr.detectChanges();
  }

  closeTab(tab: TabComponent, fromTabButton = false): void {
    if (!tab) return;

    if (this.hasCloseableEmit && fromTabButton) {
      this.closeTabButton.emit(tab);
      return;
    }

    const tabsArray = this.tabs.toArray();
    const index = tabsArray.findIndex((t) => t.code === tab.code);
    if (index === -1) return;

    const isClosingActiveTab = tab.active;

    // Se for uma aba dinâmica, removê-la corretamente do contêiner
    if (tab.isDynamicTab) {
      const dynamicIndex = this.cloneDynamicInstance.findIndex((t) => t.code === tab.code);
      if (dynamicIndex !== -1) {
        this.cloneDynamicInstance.splice(dynamicIndex, 1);
      }
    }

    // Remover a aba da lista
    tabsArray.splice(index, 1);
    this.tabs.reset(tabsArray);

    // Se não houver mais abas, limpar o contêiner dinâmico
    if (tabsArray.length === 0) {
      this.dynamicContainer.clear();
      this.cloneDynamicInstance = [];
    } else if (isClosingActiveTab) {
      // Se a aba fechada era ativa, ativar a aba anterior ou a próxima
      const newActiveIndex = index > 0 ? index - 1 : 0;
      this.selectTab(tabsArray[newActiveIndex]);
    }

    this.repairTabs();
    this.cdr.detectChanges();
  }

  private scrollView(): void {
    const activeTab = this.tabs.find((tab) => tab.active);
    if (!activeTab || !this.scrollable) return;
    this.scrollable.scrollToEnd();
  }

  protected drop(event: CdkDragDrop<TabComponent[]>): void {
    const tabsArray = this.tabs.toArray();

    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(tabsArray, event.previousIndex, event.currentIndex);

      // Atualiza a lista de abas com a nova ordem
      this.tabs.reset(tabsArray);
      this.repairTabs();
      this.cdr.detectChanges();
    }
  }

  private repairTabs(): void {
    const tabs = this.tabs.toArray();
    tabs.forEach((tab, index) => {
      tab.index = index;
      tab.isFirst = index === 0;
      tab.isLast = index === tabs.length - 1;
      tab.code = tab.code || String(index);
    });
    this.tabs.reset(tabs);
    this.cdr.detectChanges();
  }

  addNewTab(tabConfig: TabConfig, componentName: string): void {
    setTimeout(() => {
      if (!this.dynamicContainer) {
        console.error('Erro: dynamicContainer não está disponível.');
        return;
      }

      // Criar o componente dinamicamente
      const componentRef = this.dynamicLoader.loadComponent(componentName, this.dynamicContainer, tabConfig);

      if (componentRef) {
        console.error(`Componente ${componentName} carregado com sucesso.`);
      }

      // Definir nome do componente dentro da aba para referência futura
      componentRef.instance.componentName = componentName;
      componentRef.instance.isDynamicTab = true;

      this.cloneDynamicInstance.push(componentRef.instance);

      const updatedTabs = [...this.tabs.toArray(), componentRef.instance];

      // Ativar a aba recém-criada
      updatedTabs.forEach((tab) => (tab.active = false));
      componentRef.instance.active = true;

      this.tabs.reset(updatedTabs);
      this.repairTabs();
    });
  }

  handleTabKey(event: KeyboardEvent): void {
    // Implementação futura para manipulação de teclas
  }

  startEditingTabName(tab: TabComponent): void {
    tab.isNameEditing = true;
  }

  stopEditingTabName(tab: TabComponent): void {
    tab.isNameEditing = false;
    this.tabNameChanged.emit(tab);
  }

  addTabButtonClicked(): void {
    this.addTabButtonClick.emit(true);
  }
}
