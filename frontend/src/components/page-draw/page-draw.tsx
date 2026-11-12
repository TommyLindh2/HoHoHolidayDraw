import { Component, Fragment, h, State, Prop } from '@stencil/core';
import { BackendClient } from '../../services/backendClient';
import * as models from '../../models';
import { DEFAULT_PROFILE_PICTURE } from '../../config';
import { t } from '../../i18n';
import { decoyShuffle, revealRow } from '../../utils/shuffle';
import { showError, showToast } from '../../utils/ui';
import {
    AccordionGroupChangeEventDetail,
    InputCustomEvent,
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

    /** Person ids in display order. Row i shows leftSide[i] giving to rightSide[i]. */
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
    private isShuffling: boolean = false;

    @State()
    private group: models.Group;

    @State()
    private openedGroups: string[] = ['persons'];

    @State()
    private doneDrawingIndex: number[] = [];

    /** What the user typed. Empty means "give me a random draw". */
    @State()
    private seedInput: string = '';

    /** The seed behind the draw currently shown. */
    @State()
    private lastSeed: string | null = null;

    /** Bumped on every start/stop so an old animation knows to quit. */
    private shuffleRun = 0;

    private pendingWait: {
        handle: ReturnType<typeof setTimeout>;
        resolve: () => void;
    } | null = null;

    private get cssVariables(): Record<string, string> {
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

    private get canShuffle(): boolean {
        return this.persons.length >= 2;
    }

    public async componentDidLoad(): Promise<void> {
        try {
            const [group, persons] = await Promise.all([
                this.client.GetGroupById(this.groupId),
                this.client.GetPersonByGroupId(this.groupId),
            ]);
            this.group = group;
            this.persons = persons;
            this.leftSide = persons.map(p => p.id);
            this.rightSide = persons.map(p => p.id);
        } catch (error) {
            await showError(error);
        } finally {
            this.isLoading = false;
        }
    }

    public disconnectedCallback(): void {
        this.stopShuffle();
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
                                <ion-label>{t('Settings')}</ion-label>
                            </ion-item>
                            {this.renderSettings()}
                        </ion-accordion>
                        <ion-accordion value="persons">
                            <ion-item expanded slot="header">
                                <ion-label>{t('Persons')}</ion-label>
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
                            <span>{t('Draw')}</span>
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
                    label={t('Animation count - {count} time(s)', {
                        count: this.animationCount,
                    })}
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
                    label={t('Animation length - {ms}ms', {
                        ms: this.animationLength,
                    })}
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
                    label={t('Number of columns - {count}', {
                        count: this.columns,
                    })}
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
                {this.renderSeed()}
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
                    {!this.canShuffle && (
                        <ion-row>
                            <ion-col size="12">
                                <ion-text color="medium">
                                    <p>
                                        {t(
                                            'A draw needs at least two persons.'
                                        )}
                                    </p>
                                </ion-text>
                            </ion-col>
                        </ion-row>
                    )}
                    <ion-row>
                        <ion-col size="6">
                            <ion-button
                                shape="round"
                                disabled={this.isShuffling || !this.canShuffle}
                                onClick={this.startShuffle}
                                expand="block"
                            >
                                {t('Shuffle')}
                            </ion-button>
                        </ion-col>
                        <ion-col size="6">
                            <ion-button
                                shape="round"
                                disabled={!this.isShuffling}
                                onClick={this.stopShuffle}
                                expand="block"
                            >
                                {t('Stop Shuffle')}
                            </ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </container>
        );
    };

    private renderSeed = () => {
        return (
            <div class="seed">
                <ion-input
                    fill="outline"
                    label={t('Seed')}
                    labelPlacement="stacked"
                    placeholder={t('Leave empty for a random draw')}
                    helperText={t(
                        'The same seed and the same persons always give the same result.'
                    )}
                    clearInput
                    maxlength={64}
                    value={this.seedInput}
                    disabled={this.isShuffling}
                    onIonInput={(event: InputCustomEvent) =>
                        (this.seedInput = event.detail.value ?? '')
                    }
                />
                {this.lastSeed && (
                    <div class="last-seed">
                        <span>
                            {t('Seed used:')} <code>{this.lastSeed}</code>
                        </span>
                        <ion-button
                            size="small"
                            fill="clear"
                            title={t('Copy seed')}
                            onClick={this.copySeed}
                        >
                            <ion-icon slot="icon-only" name="copy-outline" />
                        </ion-button>
                        <ion-button
                            size="small"
                            fill="clear"
                            disabled={this.isShuffling}
                            onClick={() => (this.seedInput = this.lastSeed)}
                        >
                            {t('Use this seed')}
                        </ion-button>
                    </div>
                )}
            </div>
        );
    };

    private copySeed = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(this.lastSeed ?? '');
            await showToast(t('Seed copied'));
        } catch (error) {
            await showError(error);
        }
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
                                this.leftSide.indexOf(person.id),
                                cssVariables,
                                'left'
                            )}
                            <span>{t('gives to')}</span>
                            {this.renderItem(
                                person,
                                index,
                                this.rightSide.indexOf(person.id),
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
        cssVariables: Record<string, string>,
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
                        alt={t('Profile picture of {name}', {
                            name: person.name,
                        })}
                        src={pictureUrl}
                    />
                </ion-avatar>
                <ion-label>{person.name}</ion-label>
            </div>
        );
    };

    /**
     * Fetches the (seeded) result from the backend first, then animates
     * towards it row by row: a few decoy shuffles, then the real pair locks in.
     */
    private startShuffle = async (): Promise<void> => {
        this.stopShuffle();
        const run = ++this.shuffleRun;
        this.doneDrawingIndex = [];
        this.isShuffling = true;

        let result: models.DrawResult;
        try {
            result = await this.client.GetDraw(
                this.groupId,
                this.seedInput.trim() || undefined
            );
        } catch (error) {
            this.isShuffling = false;
            await showError(error);
            return;
        }
        if (run !== this.shuffleRun) {
            return;
        }
        this.lastSeed = result.seed;

        const rows = result.assignments.length;
        const steps = Math.max(1, this.animationCount);

        for (let row = 0; row < rows; row++) {
            const { giverId, receiverId } = result.assignments[row];
            for (let step = 1; step <= steps; step++) {
                // The last row has only one possible pair left, no need to wait.
                await this.wait(row === rows - 1 ? 0 : this.animationLength);
                if (run !== this.shuffleRun) {
                    return;
                }

                [this.leftSide, this.rightSide] =
                    step < steps
                        ? decoyShuffle(this.leftSide, this.rightSide, row)
                        : revealRow(
                              this.leftSide,
                              this.rightSide,
                              row,
                              giverId,
                              receiverId
                          );
            }
            this.doneDrawingIndex = [...this.doneDrawingIndex, row];
        }

        this.isShuffling = false;
    };

    private stopShuffle = (): void => {
        this.shuffleRun++;
        if (this.pendingWait) {
            clearTimeout(this.pendingWait.handle);
            this.pendingWait.resolve();
            this.pendingWait = null;
        }
        this.isShuffling = false;
    };

    private wait = (ms: number): Promise<void> =>
        new Promise(resolve => {
            this.pendingWait = {
                resolve,
                handle: setTimeout(() => {
                    this.pendingWait = null;
                    resolve();
                }, ms),
            };
        });

    private getPosition = (index: number): [number, number] => {
        const x = index % this.columns;
        const y = Math.floor(index / this.columns);

        return [x, y];
    };
}
