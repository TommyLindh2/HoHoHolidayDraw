import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-tabs',
  styleUrl: 'app-tabs.scss',
  // shadow: true,
})
export class AppTabs {
  render() {
    return (
      <ion-tabs>
        <ion-tab tab="tab-home">
          <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab tab="tab-draw">
          <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab tab="tab-people">
          <ion-nav></ion-nav>
        </ion-tab>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab-home">
            <ion-icon name="home"></ion-icon>
            <ion-label>Home</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-draw">
            <ion-icon name="shuffle-outline"></ion-icon>
            <ion-label>Draw</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="tab-people">
            <ion-icon name="people-outline"></ion-icon>
            <ion-label>People</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    );
  }
}
