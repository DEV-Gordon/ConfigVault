import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderNav } from '../header-nav/header-nav';
import { Footer } from '../footer/footer';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderNav, CommonModule, Sidebar, Footer],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})

export class AppShell {}
