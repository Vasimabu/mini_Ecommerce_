import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItems: any[] = [];  // Declare and initialize cartItems first
  private itemsSource = new BehaviorSubject<any[]>(this.cartItems);  // Initialize itemsSource after cartItems
  currentItems = this.itemsSource.asObservable();  // Observable for components to subscribe to

  constructor() {}

  addItem(newCartItem: any): void {

    const prevCartItem =this.cartItems.find((el:any)=> el.product.Id == newCartItem.product.Id)

    if(prevCartItem){
      //updatem itme qty
      this.cartItems.map((item:any)=>{
        if(item.product.Id == prevCartItem.product.Id){
          item.qty=item.qty+1
        }
        return item;
      })
    }else{
      this.cartItems.push(newCartItem);
    }
    // Add the new item to the cartItems array
    this.itemsSource.next(this.cartItems);  // Emit the updated cartItems array through the BehaviorSubject
  }

  updateItems(items: any){
    this.cartItems=items;
    this.itemsSource.next(this.cartItems)
  }
}
