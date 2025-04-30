import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { CartService } from './cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,FormsModule,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  searchText: string ='';
  cartCount =0

  constructor(private apiService: ApiService,
    private cartsService: CartService
  ){}
   
  ngOnInit(): void {
    this.cartsService.currentItems.subscribe((data:any)=>{
      this.cartCount =data.length;
    })
  }

  search(){
    console.log('Search Text:', this.searchText); // Debugging the searchText value
    this.apiService.searchProducts(this.searchText)
  }
  clearSearch(){
    this.apiService.clearSearch(this.searchText)
   }
  
   searchByEnterkey(){
    this.search()
   }
  
}
