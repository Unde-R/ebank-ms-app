import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { AfterViewChecked, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';
import { Observable, Subscription } from 'rxjs';
import { CHAT_STREAM_URL } from '../core/config';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

@Component({
  imports: [FormsModule, MarkdownComponent],
  selector: 'app-bot-ui',
  styleUrl: './bot-ui.css',
  templateUrl: './bot-ui.html',
})
export class BotUi implements AfterViewChecked, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly conversationId = crypto.randomUUID();
  private subscription?: Subscription;
  private stickToBottom = true;

  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly streaming = signal(false);
  protected draft = '';

  protected readonly suggestions = [
    'How many accounts do we have?',
    'Show me the accounts of customer 1',
    'Which customer has the highest total balance?',
    'List all customers',
  ];

  ngAfterViewChecked() {
    const el = this.scroller()?.nativeElement;
    if (el && this.stickToBottom) el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  protected onScroll() {
    const el = this.scroller()?.nativeElement;
    if (el) this.stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  protected onEnter(event: Event) {
    if ((event as KeyboardEvent).shiftKey) return;
    event.preventDefault();
    this.send();
  }

  protected send(text = this.draft) {
    const query = text.trim();
    if (!query || this.streaming()) return;

    this.draft = '';
    this.stickToBottom = true;
    this.messages.update((m) => [...m, { role: 'user', content: query }, { role: 'assistant', content: '' }]);
    this.streaming.set(true);

    const params = new HttpParams().set('query', query).set('conversationId', this.conversationId);
    const events$ = this.http.request('GET', CHAT_STREAM_URL, {
      params,
      responseType: 'text',
      observe: 'events',
      reportProgress: true,
    } as any) as unknown as Observable<HttpEvent<string>>;

    this.subscription = events$.subscribe({
      next: (event) => {
        if (event.type === HttpEventType.DownloadProgress) {
          this.setReply((event as HttpDownloadProgressEvent).partialText ?? '');
        } else if (event.type === HttpEventType.Response && event.body) {
          this.setReply(event.body);
        }
      },
      error: () => {
        this.setReply('Sorry, the assistant could not be reached. Please try again.', true);
        this.streaming.set(false);
      },
      complete: () => this.streaming.set(false),
    });
  }

  protected stop() {
    this.subscription?.unsubscribe();
    this.streaming.set(false);
  }

  protected clear() {
    this.stop();
    this.messages.set([]);
  }

  private setReply(content: string, error = false) {
    this.messages.update((list) => {
      const copy = [...list];
      copy[copy.length - 1] = { role: 'assistant', content, error };
      return copy;
    });
  }
}
