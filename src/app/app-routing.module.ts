import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Victories } from "./victories/victories";
import { VictoryEdit } from "./victories/victory-edit/victory-edit";
import { VictoryDetail } from "./victories/victory-detail/victory-detail";


const appRoutes: Routes = [
  { path: '', redirectTo: '/victories', pathMatch: 'full' }, 
  { path: 'victories', component: Victories, children: [  
    { path: 'new', component: VictoryEdit },
    // NEW: route for day-based detail list
    { path: 'day/:day', component: VictoryDetail },
    { path: 'day/:day/edit', component: VictoryEdit },
    { path: ':day/:id/edit', component: VictoryEdit },
    // ORIGINAL routes
    { path: ':id', component: VictoryDetail },
    { path: ':id/edit', component: VictoryEdit },

  ] },
]

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}