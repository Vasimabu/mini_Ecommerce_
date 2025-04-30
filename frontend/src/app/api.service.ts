import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
/* export class ApiService {

  constructor(private http:HttpClient) { }

  getProducts():Observable<any>{
   return this.http.get<any>("http://localhost:8000/api/v1/products")
  }
} */
  export class ApiService {

    constructor(private http:HttpClient) { }
  
    productsSource = new BehaviorSubject([]);
    currentProducts= this.productsSource.asObservable();
    searchText: string = '';
    productsTmp=[]

    getProducts() {
     this.http.get(environment.apiUrl+"/api/v1/products").subscribe((data:any)=>{
       this.productsSource.next(data)
       this.productsTmp=data
     })
    }

    searchProducts(searchText:string) {
     this.http.get(environment.apiUrl+"/api/v1/products",{
        params: {keyword: searchText}
      }).subscribe((data:any)=>{
        this.productsSource.next(data)
      })
    }
    clearSearch(searchText: string){
      if(this.searchText == ''){
        this.productsSource.next(this.productsTmp)
      } 
     }

     getSingleProducts(id:string){
      return this.http.get(`${environment.apiUrl}/api/v1/products/${id}`)
     }

     createorder(order:any){
      return this.http.post(environment.apiUrl+'/api/v1/order',order)
     }

  }