import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../cart.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule,FormsModule,ToastrModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  products:any =null
  quantity: number = 1;

  constructor(private route:ActivatedRoute, 
    private apiSevice: ApiService, 
    private cartService: CartService,
    private toastr: ToastrService
  ){}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id: string = params['id'];
      console.log(id);
      
      this.apiSevice.getSingleProducts(id).subscribe((data: any) => {
        // Assuming the API returns a single product object
        console.log('Product Data:', data)
        if (data && data.products) {
          const productData = data.products;
          
          // Parse the `Images` field if it exists
          if (productData.Images) {
            try {
              productData.Images = JSON.parse(productData.Images);
            } catch (e) {
              console.error('Failed to parse Images JSON:', e);
              productData.Images = []; // Fallback to an empty array if parsing fails
            }
          } else {
            productData.Images = []; // Fallback if Images is undefined or null
          }
          
          this.products = productData;
   }
    })
   })
  }
  incrementQuantity(){
    if(this.quantity == this.products.Stock){
      return;
    }
    this.quantity++;
  }

  // Method to decrement quantity
  decrementQuantity(){
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  addToCart(){
    const newCartItem={
      product:this.products,
      qty:this.quantity
    }
    if(this.products.Stock == 0){
      this.toastr.error('cannot add item due to out of stock', 'miniEcommerce',{
        positionClass:"toast-bottom-center"
      })
      return
    }
    //addcart item
    this.cartService.addItem(newCartItem)
    this.toastr.success('cartItem added', 'miniEcommerce',{
      positionClass:"toast-bottom-center"
    })
  }
 



}
