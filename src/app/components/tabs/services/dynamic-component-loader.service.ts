import {ComponentRef, Injectable, Injector, Type, ViewContainerRef} from '@angular/core';
import {TestComponent} from "../../../example/test/test.component";
import {Test1Component} from "../../../example/test1/test1.component";
import {TabConfig} from "../models/tab-config";

@Injectable({
  providedIn: 'root',
})
export class DynamicComponentLoaderService {
  private componentMap: Record<string, Type<any>> = {
    'TestComponent': TestComponent,
    'Test1Component': Test1Component
  };

  constructor(private injector: Injector) {
  }

  loadComponent(componentName: string, viewContainerRef: ViewContainerRef, tabConfig?: TabConfig): ComponentRef<any> | null {
    const componentType = this.componentMap[componentName];

    if (!componentType) {
      console.error(`Componente ${componentName} não encontrado.`);
      return null;
    }

    viewContainerRef.clear(); // Remove qualquer componente anterior antes de injetar um novo
    const componentRef = viewContainerRef.createComponent(componentType, {injector: this.injector});

    if (tabConfig) {
      Object.assign(componentRef.instance, tabConfig);
    }

    componentRef.changeDetectorRef.detectChanges(); // Força a atualização do Angular

    return componentRef;
  }

}
