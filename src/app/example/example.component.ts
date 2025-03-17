import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TestComponent } from './test/test.component';
import { TabsFullComponent } from '../components/tabs/tabs-full.component';
import { TabComponent } from '../components/tabs/components/tab/tab.component';
import { TabConfig } from '../components/tabs/models/tab-config';

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
  ],
})
export class ExampleComponent {
  @ViewChild(TabsFullComponent)
  tabsFullComponent: TabsFullComponent;
  @ViewChild('newTab')
  newTabTemplate: any;
  @ViewChildren(TestComponent)
  protected tabs: QueryList<TestComponent>;

  @Input() public tabIndicator: boolean = false;
  @Input() public isScrollable: boolean = true;
  @Input() public isDragDrop: boolean = true;
  @Input()  public isNameEditable: boolean = false;


  constructor(private cdr: ChangeDetectorRef) {}

  private get randomTitle() {
    return 'dy-' + Math.random().toString(36).substring(10);
  }

  protected newDynamicTab(): void {
    const title = this.randomTitle;
    const tabConfig: TabConfig = {
      tabTitle: title,
      closeable: true,
      code: title,
      dataContext: title,
    };
    this.tabsFullComponent?.newDynamicTab(
      tabConfig,
      this.newTabTemplate,
      tabConfig
    );
  }

  closeTabSelected(tab: TabComponent) {
    this.tabsFullComponent.closeTab(tab);
    this.cdr.detectChanges();
  }

  tabSelected(tab: TabComponent) {
    console.log('tabSelected', tab);
  }
}
