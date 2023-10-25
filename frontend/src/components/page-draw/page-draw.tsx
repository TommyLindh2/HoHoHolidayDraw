/**
 * FRONTEND:
 *  TODO: Rendering the drawing in pairs in a grid instead of just a list.
 *  TODO: Prevent endless loops if last shuffle is the same person.
 *  TODO: Be able to add/update/delete groups, persons and belongings
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
    private animationLength: number = 250;

    @State()
    private animationCount: number = 5;

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
        const [group, persons] = await Promise.all([
            this.client.GetGroupById(this.groupId),
            this.client.GetPersonByGroupId(this.groupId),
        ]).finally(() => (this.isLoading = false));

        this.group = group;
        this.persons = persons;

        this.leftSide = this.persons.map(p => p.id);
        this.rightSide = this.persons.map(p => p.id);
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
                            {this.group ? (
                                [<span>-</span>, <span>{this.group.name}</span>]
                            ) : (
                                <ion-skeleton-text animated />
                            )}
                        </div>
                    </ion-title>
                </ion-toolbar>
            </ion-header>
        );
    }

    private renderSettings = () => {
        return (
            <container>
                <h3>Settings</h3>
                <container class="settings">
                    <ion-range
                        pin
                        min={1}
                        max={50}
                        ticks
                        step={1}
                        value={this.animationCount}
                        labelPlacement="stacked"
                        label={`Animation count - ${this.animationCount} time(s)`}
                        pinFormatter={(value: number) => {
                            return `${value}`;
                        }}
                        onIonInput={(event: RangeCustomEvent) => {
                            this.animationCount = event.detail.value as number;
                        }}
                    >
                        <ion-label slot="start">1</ion-label>
                        <ion-label slot="end">50</ion-label>
                    </ion-range>
                    <ion-range
                        min={0}
                        max={1500}
                        ticks
                        step={50}
                        pin
                        value={this.animationLength}
                        pinFormatter={(value: number) => {
                            return `${value}`;
                        }}
                        labelPlacement="stacked"
                        label={`Animation length - ${this.animationLength}ms`}
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
            <container class="drawing-area">
                <ion-grid>
                    <ion-row>
                        <ion-col size="12">{this.renderPersonList()}</ion-col>
                    </ion-row>
                    <ion-row>
                        <ion-col size="6">
                            <ion-button
                                shape="round"
                                disabled={
                                    this.transitionTimeoutHandles.length > 0
                                }
                                onClick={this.startShuffle}
                                expand="block"
                            >
                                Shuffle
                            </ion-button>
                        </ion-col>
                        <ion-col size="6">
                            <ion-button
                                shape="round"
                                disabled={
                                    this.transitionTimeoutHandles.length === 0
                                }
                                onClick={this.clearTransitions}
                                expand="block"
                            >
                                Stop Shuffle
                            </ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </container>
        );
    };

    private renderPersonList = () => {
        return (
            <div class="person-list">
                {this.persons.map((person, index) => {
                    return (
                        <div class="give-container">
                            {this.renderItem(
                                person,
                                index,
                                this.leftSide.findIndex(
                                    personId => personId === person.id
                                ),
                                'left'
                            )}
                            <span>Ger till</span>
                            {this.renderItem(
                                person,
                                index,
                                this.rightSide.findIndex(
                                    personId => personId === person.id
                                ),
                                'right'
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    private renderItem = (
        person: models.Person,
        originalIndex: number,
        orderIndex: number,
        location: 'right' | 'left'
    ) => {
        const pictureUrl = person?.pictureUrl || DEFAULT_PROFILE_PICTURE;

        const diff = orderIndex - originalIndex;

        const cssAnimationLength = `${this.animationLength / 1000}s`;

        return (
            <div
                class={{ [location]: true, person: true }}
                style={{
                    '--animation-length': cssAnimationLength,
                    '--render-diff': diff.toString(),
                }}
            >
                <ion-avatar>
                    <img
                        alt={`Profile picture of ${person?.name}`}
                        src={pictureUrl}
                    />
                </ion-avatar>
                <ion-label>{person.name}</ion-label>
            </div>
        );
    };

    private shuffleListsFromIndex = (shuffleFromIndex: number = 0) => {
        return new Promise<void>(resolve => {
            this.transitionTimeoutHandles.push(
                setTimeout(
                    () => {
                        let shuffledLeftPersons;
                        let shuffledRightPersons;

                        do {
                            // Shuffle the order of leftPersons and rightPersons separately
                            shuffledLeftPersons = this.leftSide
                                .slice(0, shuffleFromIndex)
                                .concat(
                                    this.shuffleArray(
                                        this.leftSide.slice(shuffleFromIndex)
                                    )
                                );
                            shuffledRightPersons = this.rightSide
                                .slice(0, shuffleFromIndex)
                                .concat(
                                    this.shuffleArray(
                                        this.rightSide.slice(shuffleFromIndex)
                                    )
                                );
                        } while (
                            this.hasSamePersonAtSameIndex(
                                shuffledLeftPersons,
                                shuffledRightPersons
                            )
                        );

                        this.leftSide = shuffledLeftPersons;
                        this.rightSide = shuffledRightPersons;

                        resolve();
                    },
                    shuffleFromIndex >= this.persons.length - 1
                        ? 0
                        : this.animationLength
                )
            );
        });
    };

    private startShuffle = async () => {
        this.clearTransitions();

        for (
            let personIndex = 0;
            personIndex < this.persons.length;
            personIndex++
        ) {
            for (let i = 0; i < Math.max(1, this.animationCount); i++) {
                await this.shuffleListsFromIndex(personIndex);
            }
        }

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
}
