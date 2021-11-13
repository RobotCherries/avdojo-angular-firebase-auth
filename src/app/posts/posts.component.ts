import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap, scan, tap, throttleTime } from 'rxjs/operators';
import { IPaginationConfig } from '../shared/interfaces/pagination-config.interface';
import { PostService } from '../shared/services/post/post.service';
import { IPost } from './../shared/interfaces/post.interface';

@Component({
  selector: 'avd-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  // List items
  posts$: Observable<IPost[]> = of([]);
  paginationConfig: BehaviorSubject<IPaginationConfig> = new BehaviorSubject({
    pageNr: 1,
    itemsPerPage: 10
  });

  // Virtual scroll
  @ViewChild(CdkVirtualScrollViewport) virtualViewport!: CdkVirtualScrollViewport;
  postsViewportEnd: boolean = false;

  // Page helpers
  isPageLoading: BehaviorSubject<boolean> = new BehaviorSubject(<boolean>false);

  constructor(private _postService: PostService) {
  }

  public ngOnInit(): void {
    this._renderPosts();
  }

  private _renderPosts(): void {
    const postsMap = this.paginationConfig.pipe(
      throttleTime(500),
      tap(() => this.isPageLoading.next(true)),
      mergeMap((config: IPaginationConfig) => this._getPosts(config)),
      scan((acc: any, posts: IPost[]) => {
        this.isPageLoading.next(false);
        return { ...acc, ...posts };
      }, {})
    );

    this.posts$ = postsMap.pipe(map((posts: IPost[]) => Object.values(posts)));
  }

  private _getPosts(paginationConfig: IPaginationConfig): Observable<IPost[]> {
    this.isPageLoading.next(true);

    return this._postService
      .getAllPaged(paginationConfig)
      .pipe(
        tap((posts: IPost[]) => {
          posts.length ? null : (this.postsViewportEnd = true);
          this.isPageLoading.next(false);
        }),
      );
  }

  public getMorePosts(lastViewedIndex: number, lastArrayItemIndex: number): void {
    if (this.postsViewportEnd) {
      return;
    }

    const listEnd = this.virtualViewport.getRenderedRange().end;
    const listTotal = this.virtualViewport.getDataLength();
    const updatedItemsPerPage = lastArrayItemIndex + 5;

    if (listEnd === listTotal) {
      this.paginationConfig.next({
        pageNr: 1,
        itemsPerPage: updatedItemsPerPage
      });
    }
  }

  public trackByIndex(index: number): number {
    return index;
  }
}

