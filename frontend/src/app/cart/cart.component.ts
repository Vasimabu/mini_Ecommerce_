import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CartService } from '../cart.service';
import { ApiService } from '../api.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterModule,ToastrModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit{
  cartItems:any[] =[]

  cartCount=0
  subtotal= 0
  estamount=0
  tax:number =0
  total=0

  constructor(private cartService:CartService,
    private apiService:ApiService,
    private router:Router,
    private toastr: ToastrService

  ){}

  ngOnInit(): void {
    this.cartService.currentItems.subscribe((data: any[]) => {
     // console.log('cart', data);
      this.cartItems = Array.isArray(data) ? data : [];  // Ensure cartItems is an array
      //console.log("cartItems after subscription:", this.cartItems);
      
      this.calculateCartItems();
    });
  }
  
  
  deleteItem(product_Id:number){
   // console.log('Deleting item with Id:', product_Id);
    const prevItem:any=this.cartItems.find((item:any)=> item.product.Id == product_Id)
    if(prevItem){
      const filteredItems = this.cartItems.filter((item:any)=> item.product.Id !== product_Id)
     // this.cartItems = filteredItems
      this.cartService.updateItems(filteredItems)
    }
    this.calculateCartItems()
  }
  calculateCartItems(){
     console.log(this.cartItems);
     
      this.cartCount = this.cartItems.length;
      this.subtotal = this.cartItems.reduce((acc: number, current: any) => acc + current.qty, 0);
      this.estamount = this.cartItems.reduce((acc: number, current: any) => {
        // Check if current.products.Price and current.qty are numbers
        const price = typeof current.product.Price === 'number' ? current.product.Price : parseFloat(current.product.Price);
        const qty = typeof current.qty === 'number' ? current.qty : parseInt(current.qty, 10);
        return acc + (price * qty);
      }, 0);
      this.tax=10
      this.total=this.estamount+this.tax

      
   // console.log('Cart Count:', this.cartCount);
    //console.log('Subtotal:', this.subtotal);
    //console.log('Est. Amount:', this.estamount);
    }

    decreseqty(product_Id:string){
      const prevCartItem:any=this.cartItems.find((item:any)=> item.product.Id == product_Id)
      let qty=prevCartItem.qty
      if(qty == 1){
        return;
      }
      qty= qty - 1;
      if(prevCartItem){
        //updatem itme qty
        this.cartItems.map((item:any)=>{
          if(item.product.Id == prevCartItem.product.Id){
            item.qty=qty
          }
          return item;
        })
      }
      this.cartService.updateItems(this.cartItems)
    }
    increaseqty(product_Id:string){
      const prevCartItem:any=this.cartItems.find((item:any)=> item.product.Id == product_Id)
      let qty=prevCartItem.qty
      if(qty == prevCartItem.product.Stock){
        this.toastr.error('cannot increase qty', 'miniEcommerce',{
          positionClass:"toast-bottom-center"
        })
        return;
      }
      qty= qty + 1;
      if(prevCartItem){
        //updatem itme qty
        this.cartItems= this.cartItems.map((item:any)=>{
          if(item.product.Id == prevCartItem.product.Id){
            item.qty=qty
          }
          return item;
        })
      }
      this.cartService.updateItems(this.cartItems)

    }
    orderComplete() {
      // Create an order object with necessary fields
      const order = {
        cartItems: this.cartItems,  // Items in the cart
        amount: this.total,         // Total amount
        status: 'pending'           // Order status (you can change this based on your logic)
      };
    
      console.log('Order to be sent:', order);
    
      // API call to create the order
      this.apiService.createorder(order).subscribe(
        (data: any) => {
          console.log('Order response:', data);
      
          if (data.success) {
            // Check the structure of data.order
            console.log('Order object:', data.order);
      
            const orderId = data.order?.id;
            console.log('Order ID:', orderId);
      
            if (orderId) {
              // Navigate to the success page with order ID
              this.router.navigate(['order', 'success', orderId]);
            } else {
              console.error('Order ID not found in the response');
            }
          } else {
            console.error('Order creation failed:', data.message);
          }
        },
        (error) => {
          console.error('Error creating order:', error);
        }
      );
      
    }
    
}
