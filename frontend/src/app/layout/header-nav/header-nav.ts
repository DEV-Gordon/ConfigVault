import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Search } from '../../core/services/search';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header-nav.html',
  styleUrls: ['./header-nav.css'],
})
export class HeaderNav {
  protected search = inject(Search);
  protected searchQuery = '';

  onSearchInput(): void {
    // Keep the search service in sync with the header input on every change.
    this.search.setQuery(this.searchQuery);
  }
}