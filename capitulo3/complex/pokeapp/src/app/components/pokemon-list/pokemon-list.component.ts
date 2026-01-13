import { Component, computed, effect, inject, signal } from '@angular/core';
import { Pokemon, PokemonService } from '../../services/pokemon.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokemon-list',
  imports: [FormsModule],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})
export class PokemonListComponent {
  private readonly service=inject(PokemonService);
  private readonly responseService=toSignal(this.service.getPokemons(), {initialValue:[] as Pokemon[]});
  private readonly pokemons=signal<Pokemon[]>([]);
  pokemon=signal<string>('');

  private readonly pokemonsFiltered=computed(()=>
    this.pokemons().filter(t=>t.name.toLowerCase().includes(this.pokemon().toLowerCase()))
  );

  pokemonsPagination=computed(()=>
       this.pokemonsFiltered().slice(this.positionInitial(), this.positionFinal())
  );

  private readonly positionInitial=signal<number>(0);
  private readonly positionFinal=computed(()=>this.positionInitial()+2);  

  constructor(){
    effect(()=>{
      this.pokemons.set(this.responseService());
    })
  }

  next(){
    console.log(this.pokemonsFiltered().length)
    if((this.positionFinal()+2) > this.pokemonsFiltered().length-1){
         this.positionInitial.update(t=>this.pokemonsFiltered().length-1);
    }else{
      this.positionInitial.update(t=>t+2);
    }


      
    console.log(this.positionInitial()+"----"+this.positionFinal());
  }

  preview(){
    if(this.pokemonsFiltered().length===0 || (this.positionInitial()-2)<=0){
      this.positionInitial.set(0);
    }else{
      this.positionInitial.update(t=>t-2);
    }

    console.log(this.positionInitial()+"----"+this.positionFinal());
  }

}
