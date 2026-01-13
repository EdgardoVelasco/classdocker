import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PokemonCardComponent } from './components/pokemon-card/pokemon-card.component';
import { NotFoundCardComponent } from './components/not-found-card/not-found-card.component';

export const routes: Routes = [
    {path:"", component:HomeComponent},
    {path:"pokemons", loadComponent:()=>import('./components/pokemon-list/pokemon-list.component').then(m=>m.PokemonListComponent)},
    {path:"pokemon", component:PokemonCardComponent},
    {path:"**", component:NotFoundCardComponent}
];
