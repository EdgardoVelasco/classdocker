import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { mergeMap, Observable, of, toArray } from 'rxjs';


export interface Ability{
  name:string;
}

export interface Crie{
  latest:string;
  legacy:string;
}

export interface Pokemon{
  name:string;
  abilities:Ability[];
  imageUrl:string;
  weight:string;
  cries:Crie;
}


@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private readonly http=inject(HttpClient)
  private readonly urlBase="https://pokeapi.co/api/v2/pokemon?limit=500";


  getPokemons():Observable<Pokemon[]>{
    return this.http.get<any>(this.urlBase)
       .pipe(
        mergeMap(t=>t.results),
        mergeMap((t:any)=>this.http.get<any>(t.url)),
        mergeMap(objectJson=>{
             const abilities:Ability[]=[];
             objectJson.abilities.forEach((t: { ability: { name: any; }; }) => {
                  abilities.push({name:t.ability.name})
             });
             
             let data=objectJson.cries as Partial<Crie>;

             const pokemon:Pokemon={
              name:objectJson.name,
              abilities:abilities,
              cries:{latest:data.latest??"", legacy:data.legacy??""},
              imageUrl:objectJson.sprites.other['official-artwork'].front_default,
              weight:objectJson.weight
             }

             return of(pokemon);
        }),
        toArray()
       );
  }


}
