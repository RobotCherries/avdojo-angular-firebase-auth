import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPaginationConfig } from './../../interfaces/pagination-config.interface';
import { IPost } from './../../interfaces/post.interface';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  defaultPaginationConfig: IPaginationConfig = {
    pageNr: 1,
    itemsPerPage: 10
  }
  baseUrl: string = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private _http: HttpClient) { }

  getAll(): Observable<IPost[]> {
    return this._http.get<IPost[]>(this.baseUrl);
  }

  getAllPaged(pc: IPaginationConfig): Observable<IPost[]> {
    const { pageNr, itemsPerPage } = this.defaultPaginationConfig;

    return this._http.get<IPost[]>(
      `${this.baseUrl}?_page=${pc?.pageNr || pageNr}&_limit=${pc?.itemsPerPage || itemsPerPage}`
    );
  }

}
