import { Component, Fragment, h, State } from '@stencil/core';
import { BackendClient } from '../../services/backendClient';
import * as models from '../../models';
import { DEFAULT_PROFILE_PICTURE } from '../../config';
import { RangeCustomEvent } from '@ionic/core';

const ITEM_HEIGHT = 44;

@Component({
  tag: 'page-draw',
  styleUrl: 'page-draw.scss',
  // shadow: true,
})
export class PageDraw {
  private peopleList: models.People[] = [];

  @State()
  private leftSide: number[] = [];

  @State()
  private rightSide: number[] = [];

  @State()
  private animationLength: number = 300;

  @State()
  private animationCount: number = 10;

  @State()
  private isLoading: boolean = true;

  @State()
  private transitionTimeoutHandles: NodeJS.Timeout[] = [];

  private get client(): BackendClient {
    return BackendClient.GetInstance();
  }

  public async componentDidLoad() {
    this.peopleList = await this.client.GetPeople().finally(() => (this.isLoading = false));
    this.rightSide = this.peopleList.map(p => p.id);
    this.leftSide = this.peopleList.map(p => p.id);
  }

  public render() {
    return (
      <Fragment>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Draw</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          {this.renderLoader()}
          {this.renderPeopleDrawArea()}
          {this.renderSettings()}
        </ion-content>
      </Fragment>
    );
  }

  private renderSettings = () => {
    return (
      <ion-card>
        <ion-card-header>
          <ion-card-title>Settings</ion-card-title>
          <ion-card-subtitle>Animation settings</ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-range
            pin
            min="0"
            max="50"
            value={this.animationCount}
            labelPlacement="stacked"
            label={`Animation count (${this.animationCount} time(s))`}
            pinFormatter={(value: number) => {
              return `${value} time(s)`;
            }}
            onIonChange={(event: RangeCustomEvent) => {
              this.animationCount = event.detail.value as number;
            }}
          ></ion-range>

          <ion-range
            min="0"
            max="1500"
            pin
            value={this.animationLength}
            pinFormatter={(value: number) => {
              return `${value}ms`;
            }}
            labelPlacement="stacked"
            label={`Animation length (${this.animationLength}s)`}
            onIonChange={(event: RangeCustomEvent) => {
              this.animationLength = event.detail.value as number;
            }}
          ></ion-range>
        </ion-card-content>
      </ion-card>
    );
  };

  private renderLoader = () => {
    if (!this.isLoading) {
      return;
    }

    return <ion-spinner name="dots"></ion-spinner>;
  };

  private renderPeopleDrawArea = () => {
    if (this.isLoading) {
      return;
    }

    return (
      <ion-grid>
        <ion-row>
          <ion-col size="6">{this.renderPeopleList(this.leftSide)}</ion-col>
          <ion-col size="6">{this.renderPeopleList(this.rightSide)}</ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">
            <ion-button shape="round" disabled={this.transitionTimeoutHandles.length > 0} onClick={this.shuffle} expand="block">
              Shuffle
            </ion-button>
          </ion-col>
          <ion-col size="6">
            <ion-button shape="round" disabled={this.transitionTimeoutHandles.length === 0} onClick={this.clearTransitions} expand="block">
              Stop Shuffle
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    );
  };

  private renderPeopleList = (peopleOrder: number[]) => {
    return (
      <ion-list class="person-list">
        {this.peopleList.map((people, index) =>
          this.renderItem(
            people,
            index,
            this.peopleList.findIndex(p => p.id === peopleOrder[index]),
          ),
        )}
      </ion-list>
    );
  };

  private shuffle = async () => {
    const animationLength = this.animationLength;
    const loopLength = animationLength ? this.animationCount : 1;

    this.clearTransitions();

    await new Promise<void>(resolve => {
      for (let i = 0; i < loopLength; i++) {
        this.transitionTimeoutHandles.push(
          setTimeout(() => {
            let shuffledLeftPersons;
            let shuffledRightPersons;

            do {
              // Shuffle the order of leftPersons and rightPersons separately
              shuffledLeftPersons = this.shuffleArray(this.leftSide);
              shuffledRightPersons = this.shuffleArray(this.rightSide);
            } while (this.hasSamePersonAtSameIndex(shuffledLeftPersons, shuffledRightPersons));

            this.leftSide = shuffledLeftPersons;
            this.rightSide = shuffledRightPersons;

            if (i === loopLength - 1) {
              setTimeout(() => {
                resolve();
              }, animationLength);
            }
          }, i * animationLength),
        );
      }
    });

    this.clearTransitions();
  };

  private clearTransitions = () => {
    for (const timeoutHandle of this.transitionTimeoutHandles) {
      clearTimeout(timeoutHandle);
    }
    this.transitionTimeoutHandles = [];
  };

  private hasSamePersonAtSameIndex(arr1: any[], arr2: any[]) {
    // Helper function to check if the same person appears at the same index in both lists
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] === arr2[i]) {
        return true;
      }
    }
    return false;
  }

  private shuffleArray = (array: any[]): any[] => {
    // Randomly shuffle the array using Fisher-Yates algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return [...array];
  };

  private renderItem = (people: models.People, originalIndex: number, orderIndex: number) => {
    const pictureUrl = people?.pictureUrl || DEFAULT_PROFILE_PICTURE;

    const diff = orderIndex - originalIndex;

    const cssAnimationLength = `${this.animationLength / 1000}s`;

    return (
      <ion-item
        class="people"
        style={{
          '--animation-length': cssAnimationLength,
          'transform': `translateY(${diff * ITEM_HEIGHT}px)`,
        }}
      >
        <ion-avatar>
          <img alt={`Profile picture of ${people?.name}`} src={pictureUrl} />
        </ion-avatar>
        <ion-label>{people.name}</ion-label>
      </ion-item>
    );
  };
}
