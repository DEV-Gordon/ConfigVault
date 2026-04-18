import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Search } from '../../core/services/search';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './header-nav.html',
  styleUrls: ['./header-nav.css'],
})
export class HeaderNav {
  protected search = inject(Search);
  protected searchQuery = '';

  onSearchInput(): void {
    this.search.setQuery(this.searchQuery);
  }
}