import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShell } from './layout/app-shell/app-shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppShell],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
