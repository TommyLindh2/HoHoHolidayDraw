import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  // shadow: true,
})
export class AppRoot {
  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route-redirect from="/" to="/tab/home"></ion-route-redirect>
          <ion-route url="/tab" component="app-tabs">
            <ion-route url="/home" component="tab-home">
              <ion-route component="page-home"></ion-route>
            </ion-route>
            <ion-route url="/people" component="tab-people">
              <ion-route component="page-people-list"></ion-route>
            </ion-route>
            <ion-route url="/draw" component="tab-draw">
              <ion-route component="page-draw"></ion-route>
            </ion-route>
          </ion-route>
          <ion-route url="/profile/:peopleId" component="page-profile"></ion-route>
        </ion-router>
        <ion-nav></ion-nav>
      </ion-app>
    );
  }
}
