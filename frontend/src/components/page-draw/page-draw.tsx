/**
 * FRONTEND:
 *  TODO: Shuffle should stop 1 row, and then next row and next, so everyting don't stop at the same time
 *  TODO: Be able to add/update/delete groups, persons and belongings
 *  TODO: Prevent endless loops if last shuffle is the same person.
 *
 * BACKEND:
 *  TODO: Add delete endpoints
 *  TODO: Implement database storage
 */
import { Component, Fragment, h, State, Prop } from '@stencil/core';
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
  private persons: models.Person[] = [];

  @Prop()
  public groupId: number;

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

  @State()
  private group: models.Group;

  private get client(): BackendClient {
    return BackendClient.GetInstance();
  }

  public async componentDidLoad() {
    const [group, persons] = await Promise.all([this.client.GetGroupById(this.groupId), this.client.GetPersonByGroupId(this.groupId)]).finally(() => (this.isLoading = false));

    this.group = group;
    this.persons = persons;

    this.rightSide = this.persons.map(p => p.id);
    this.leftSide = this.persons.map(p => p.id);
  }

  public render() {
    return (
      <Fragment>
        {this.renderHeader()}
        <ion-content class="ion-padding">
          <div class="content">
            {this.renderLoader()}
            {this.renderPersonDrawArea()}
            {this.renderSettings()}
          </div>
        </ion-content>
      </Fragment>
    );
  }

  private renderSettings = () => {
    return (
      <container>
        <h3>Settings</h3>
        <container class="settings">
          <ion-range
            pin
            min="0"
            max="50"
            ticks
            step="1"
            value={this.animationCount}
            labelPlacement="stacked"
            label={`Animation count - ${this.animationCount} time(s)`}
            pinFormatter={(value: number) => {
              return `${value} time(s)`;
            }}
            onIonInput={(event: RangeCustomEvent) => {
              this.animationCount = event.detail.value as number;
            }}
          >
            <ion-label slot="start">0</ion-label>
            <ion-label slot="end">50</ion-label>
          </ion-range>
          <ion-range
            min="0"
            max="1500"
            ticks
            step="50"
            pin
            value={this.animationLength}
            pinFormatter={(value: number) => {
              return `${value}ms`;
            }}
            labelPlacement="stacked"
            label={`Animation length - ${this.animationLength}s`}
            onIonInput={(event: RangeCustomEvent) => {
              this.animationLength = event.detail.value as number;
            }}
          >
            <ion-icon slot="start" name="airplane-outline" />
            <ion-icon slot="end" name="walk-outline" />
          </ion-range>
        </container>
      </container>
    );
  };

  private renderLoader = () => {
    if (!this.isLoading) {
      return;
    }

    return <ion-spinner name="dots"></ion-spinner>;
  };

  private renderPersonDrawArea = () => {
    if (this.isLoading) {
      return;
    }

    return (
      <container>
        <h3>Drawing</h3>
        <container class="drawing-area">
          <ion-grid>
            <ion-row>
              <ion-col size="6">{this.renderPersonList(this.leftSide)}</ion-col>
              <ion-col size="6">{this.renderPersonList(this.rightSide)}</ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="6">
                <ion-button shape="round" disabled={this.transitionTimeoutHandles.length > 0} onClick={this.startShuffle} expand="block">
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
        </container>
      </container>
    );
  };

  private renderPersonList = (personOrder: number[]) => {
    return (
      <ion-list class="person-list">
        {this.persons.map((person, index) =>
          this.renderItem(
            person,
            index,
            this.persons.findIndex(p => p.id === personOrder[index]),
          ),
        )}
      </ion-list>
    );
  };

  private shuffleWithoutGivingToOneself = () => {
    return new Promise<void>(resolve => {
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

          resolve();
        }, this.animationLength),
      );
    });
  };

  private startShuffle = async () => {
    this.clearTransitions();

    for (let i = 0; i < Math.max(1, this.animationCount); i++) {
      await this.shuffleWithoutGivingToOneself();
    }

    this.clearTransitions();
  };

  private clearTransitions = () => {
    for (const timeoutHandle of this.transitionTimeoutHandles) {
      clearTimeout(timeoutHandle);
    }
    this.transitionTimeoutHandles = [];
  };

  private renderHeader() {
    return (
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-back-button defaultHref="/tab/draw"></ion-back-button>
          </ion-buttons>
          <ion-title>
            <div class="title">
              <span>Draw</span>
              {this.group ? [<span>-</span>, <span>{this.group.name}</span>] : <ion-skeleton-text animated />}
            </div>
          </ion-title>
        </ion-toolbar>
      </ion-header>
    );
  }

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

  private renderItem = (person: models.Person, originalIndex: number, orderIndex: number) => {
    const pictureUrl = person?.pictureUrl || DEFAULT_PROFILE_PICTURE;

    const diff = orderIndex - originalIndex;

    const cssAnimationLength = `${this.animationLength / 1000}s`;

    return (
      <ion-item
        class="person"
        style={{
          '--animation-length': cssAnimationLength,
          'transform': `translateY(${diff * ITEM_HEIGHT}px)`,
        }}
      >
        <ion-avatar>
          <img alt={`Profile picture of ${person?.name}`} src={pictureUrl} />
        </ion-avatar>
        <ion-label>{person.name}</ion-label>
      </ion-item>
    );
  };
}
