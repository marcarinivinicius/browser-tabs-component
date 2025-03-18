import {CommonModule} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  ViewChildren,
  QueryList,
  TemplateRef,
  AfterViewInit,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {TestComponent} from './test/test.component';
import {TabsFullComponent} from '../components/tabs/tabs-full.component';
import {TabComponent} from '../components/tabs/components/tab/tab.component';
import {TabConfig} from '../components/tabs/models/tab-config';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    TabsFullComponent,
    TestComponent,
    FormsModule,
  ],
})
export class ExampleComponent implements AfterViewInit {
  @ViewChild(TabsFullComponent, {static: false}) tabsFullComponent!: TabsFullComponent;
  @ViewChild('newTab', {static: false}) newTabTemplate!: TemplateRef<any>;

  @ViewChildren(TestComponent) protected tabs!: QueryList<TestComponent>;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges(); // Garante que os elementos foram renderizados antes de usá-los.
  }

  private get randomTitle(): string {
    return 'dy-' + Math.random().toString(36).substring(10);
  }

  protected newDynamicTab(component: string, titleComponent?: string): void {
    if (!this.tabsFullComponent || !this.newTabTemplate) {
      console.error('TabsFullComponent ou newTabTemplate ainda não estão disponíveis.');
      return;
    }

    const title = this.randomTitle;
    const tabConfig: TabConfig = {
      tabTitle: title,
      closeable: true,
      code: title,
      dataContext: {tabTitle: title, code: title}, // Mantém os dados estruturados
    };

    this.tabsFullComponent.addNewTab(tabConfig, component);
  }

  closeTabSelected(tab: TabComponent): void {
    if (this.tabsFullComponent) {
      this.tabsFullComponent.closeTab(tab);
      this.cdr.detectChanges();
    }
  }

  tabSelected(tab: TabComponent): void {

  }
}
