/**
 * FRONTEND:
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
import {
    AccordionGroupChangeEventDetail,
    IonAccordionGroupCustomEvent,
    RangeCustomEvent,
} from '@ionic/core';

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
    private columns = 1;

    @State()
    private isLoading: boolean = true;

    @State()
    private transitionTimeoutHandles: NodeJS.Timeout[] = [];

    @State()
    private group: models.Group;

    @State()
    private openedGroups: string[] = ['persons'];

    @State()
    private doneDrawingIndex: number[] = [];

    private get cssVariables() {
        const isCompact = this.columns > 1;

        const cssVariables = {
            '--columns': this.columns.toString(),
            '--column-width': 'min(55rem, 100%)',
            '--column-height': '3rem',
        };

        if (isCompact) {
            cssVariables['--column-width'] = '15rem';
            cssVariables['--column-height'] = '5rem';
        }

        return cssVariables;
    }

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
                    {this.renderLoader()}
                    <ion-accordion-group
                        onIonChange={this.accordionGroupChange}
                        class="content"
                        multiple
                        value={this.openedGroups}
                    >
                        <ion-accordion value="settings">
                            <ion-item slot="header">
                                <ion-label>Settings</ion-label>
                            </ion-item>
                            {this.renderSettings()}
                        </ion-accordion>
                        <ion-accordion value="persons">
                            <ion-item expanded slot="header">
                                <ion-label>Persons</ion-label>
                            </ion-item>
                            {this.renderPersonDrawArea()}
                        </ion-accordion>
                    </ion-accordion-group>
                </ion-content>
            </Fragment>
        );
    }

    private accordionGroupChange = (
        event: IonAccordionGroupCustomEvent<AccordionGroupChangeEventDetail>
    ) => {
        console.log('event', event);
        const toggledItem = event.detail.value;

        const index = this.openedGroups.indexOf(toggledItem);

        if (index < 0) {
            this.openedGroups.push(toggledItem);
        } else {
            this.openedGroups = this.openedGroups.filter(
                (_item, i) => i !== index
            );
        }
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
            <container
                slot="content"
                class="settings"
                onIonChange={(event: CustomEvent) => event.stopPropagation()}
            >
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
                <ion-range
                    pin
                    min={1}
                    max={6}
                    ticks
                    snaps
                    step={1}
                    value={this.columns}
                    labelPlacement="stacked"
                    label={`Number of columns - ${this.columns}`}
                    pinFormatter={(value: number) => {
                        return `${value}`;
                    }}
                    onIonInput={(event: RangeCustomEvent) => {
                        this.columns = event.detail.value as number;
                    }}
                >
                    <ion-label slot="start">1</ion-label>
                    <ion-label slot="end">6</ion-label>
                </ion-range>
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
            <container
                slot="content"
                onIonChange={(event: CustomEvent) => event.stopPropagation()}
            >
                <ion-grid class="drawing-area">
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
        const cssVariables = this.cssVariables;
        return (
            <div
                class={{ 'person-list': true, compact: this.columns > 1 }}
                style={cssVariables}
            >
                {this.persons.map((person, index) => {
                    return (
                        <div
                            class={{
                                'give-container': true,
                                'done-drawing':
                                    this.doneDrawingIndex.includes(index),
                            }}
                            style={cssVariables}
                        >
                            {this.renderItem(
                                person,
                                index,
                                this.leftSide.findIndex(
                                    personId => personId === person.id
                                ),
                                cssVariables,
                                'left'
                            )}
                            <span>ger till</span>
                            {this.renderItem(
                                person,
                                index,
                                this.rightSide.findIndex(
                                    personId => personId === person.id
                                ),
                                cssVariables,
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
        cssVariables: any,
        position: 'left' | 'right'
    ) => {
        const pictureUrl = person?.pictureUrl || DEFAULT_PROFILE_PICTURE;

        const [orderX, orderY] = this.getPosition(orderIndex);
        const [orgX, orgY] = this.getPosition(originalIndex);

        const diffY = orderY - orgY;
        const diffX = orderX - orgX;

        const cssAnimationLength = `${this.animationLength / 1000}s`;

        return (
            <div
                class={{ person: true, [position]: true }}
                style={{
                    '--animation-length': cssAnimationLength,
                    '--render-diff-y': diffY.toString(),
                    '--render-diff-x': diffX.toString(),
                    ...cssVariables,
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
        this.doneDrawingIndex = [];

        for (
            let personIndex = 0;
            personIndex < this.persons.length;
            personIndex++
        ) {
            for (let i = 0; i < Math.max(1, this.animationCount); i++) {
                await this.shuffleListsFromIndex(personIndex);
            }
            this.doneDrawingIndex.push(personIndex);
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

    private getPosition = (index: number): [number, number] => {
        const x = index % this.columns;
        const y = Math.floor(index / this.columns);

        return [x, y];
    };
}
