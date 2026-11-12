import { Component, Fragment, h, Prop, State } from '@stencil/core';
import {
    CheckboxCustomEvent,
    InputCustomEvent,
    modalController,
    SelectCustomEvent,
} from '@ionic/core';
import * as models from '../../models';
import { BackendClient } from '../../services/backendClient';
import { DEFAULT_PROFILE_PICTURE } from '../../config';
import { t } from '../../i18n';
import { errorMessage } from '../../utils/ui';

@Component({
    tag: 'group-editor',
    styleUrl: 'group-editor.scss',
})
export class GroupEditor {
    /** The group to edit. Leave out to create a new group. */
    @Prop() group?: models.Group;

    @State() private name = '';
    @State() private selectedIds: readonly number[] = [];
    @State() private exclusions: readonly models.Exclusion[] = [];
    @State() private persons: models.Person[] = [];
    @State() private isLoading = true;
    @State() private isSaving = false;
    @State() private error: string | null = null;

    private get client(): BackendClient {
        return BackendClient.GetInstance();
    }

    public async componentWillLoad(): Promise<void> {
        this.name = this.group?.name ?? '';
        this.selectedIds = this.group?.personIds ?? [];
        this.exclusions = this.group?.exclusions ?? [];
        try {
            this.persons = await this.client.GetPersons();
        } catch (error) {
            this.error = errorMessage(error);
        } finally {
            this.isLoading = false;
        }
    }

    private toggle = (personId: number, checked: boolean): void => {
        const others = this.selectedIds.filter(id => id !== personId);
        this.selectedIds = checked ? [...others, personId] : others;
        if (!checked) {
            // Exclusions only make sense between members.
            this.exclusions = this.exclusions.filter(
                e => e.giverId !== personId && e.receiverId !== personId
            );
        }
    };

    private excludedFor = (giverId: number): number[] =>
        this.exclusions
            .filter(e => e.giverId === giverId)
            .map(e => e.receiverId);

    private setExcluded = (
        giverId: number,
        receiverIds: readonly number[]
    ): void => {
        this.exclusions = [
            ...this.exclusions.filter(e => e.giverId !== giverId),
            ...receiverIds.map(receiverId => ({ giverId, receiverId })),
        ];
    };

    private save = async (event?: Event): Promise<void> => {
        event?.preventDefault();
        const name = this.name.trim();
        if (!name) {
            this.error = t('Name is required');
            return;
        }

        this.isSaving = true;
        this.error = null;
        try {
            const input = {
                name,
                personIds: this.selectedIds,
                exclusions: this.exclusions,
            };
            const saved = this.group
                ? await this.client.UpdateGroup(this.group.id, input)
                : await this.client.CreateGroup(input);
            await modalController.dismiss(saved, 'save');
        } catch (error) {
            this.error = errorMessage(error);
        } finally {
            this.isSaving = false;
        }
    };

    private cancel = (): Promise<boolean> =>
        modalController.dismiss(undefined, 'cancel');

    public render() {
        return (
            <Fragment>
                <ion-header>
                    <ion-toolbar color="primary">
                        <ion-buttons slot="start">
                            <ion-button onClick={this.cancel}>
                                {t('Cancel')}
                            </ion-button>
                        </ion-buttons>
                        <ion-title>
                            {this.group ? t('Edit group') : t('New group')}
                        </ion-title>
                        <ion-buttons slot="end">
                            <ion-button
                                strong
                                disabled={this.isSaving || this.isLoading}
                                onClick={() => this.save()}
                            >
                                {t('Save')}
                            </ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <form onSubmit={this.save}>
                        <ion-list>
                            <ion-item>
                                <ion-input
                                    label={t('Name')}
                                    labelPlacement="stacked"
                                    value={this.name}
                                    required
                                    autofocus
                                    maxlength={100}
                                    onIonInput={(event: InputCustomEvent) =>
                                        (this.name = event.detail.value ?? '')
                                    }
                                />
                            </ion-item>
                        </ion-list>
                        {this.error && (
                            <ion-text color="danger">
                                <p>{this.error}</p>
                            </ion-text>
                        )}
                        <input type="submit" hidden />
                    </form>
                    {this.renderMembers()}
                    {this.renderExclusions()}
                </ion-content>
            </Fragment>
        );
    }

    private renderMembers = () => {
        if (this.isLoading) {
            return <ion-spinner name="dots"></ion-spinner>;
        }

        return (
            <ion-list>
                <ion-list-header>
                    <ion-label>
                        {t('Members ({count})', {
                            count: this.selectedIds.length,
                        })}
                    </ion-label>
                </ion-list-header>
                {this.persons.map(person => (
                    <ion-item key={person.id}>
                        <ion-avatar slot="start">
                            <img
                                alt={t('Profile picture of {name}', {
                                    name: person.name,
                                })}
                                src={person.pictureUrl || DEFAULT_PROFILE_PICTURE}
                            />
                        </ion-avatar>
                        <ion-checkbox
                            justify="space-between"
                            checked={this.selectedIds.includes(person.id)}
                            onIonChange={(event: CheckboxCustomEvent) =>
                                this.toggle(person.id, event.detail.checked)
                            }
                        >
                            {person.name}
                        </ion-checkbox>
                    </ion-item>
                ))}
            </ion-list>
        );
    };

    private renderExclusions = () => {
        const members = this.persons.filter(p =>
            this.selectedIds.includes(p.id)
        );
        if (this.isLoading || members.length < 2) {
            return;
        }

        return (
            <ion-list>
                <ion-list-header>
                    <ion-label>
                        <h2>{t('Exclusions')}</h2>
                        <p>{t("Choose who each person won't give to in this group.")}</p>
                    </ion-label>
                </ion-list-header>
                {members.map(giver => (
                    <ion-item key={giver.id}>
                        <ion-avatar slot="start">
                            <img
                                alt={t('Profile picture of {name}', {
                                    name: giver.name,
                                })}
                                src={giver.pictureUrl || DEFAULT_PROFILE_PICTURE}
                            />
                        </ion-avatar>
                        <ion-select
                            label={t("{name} won't give to", {
                                name: giver.name,
                            })}
                            labelPlacement="stacked"
                            placeholder={t('Nobody')}
                            multiple
                            okText={t('OK')}
                            cancelText={t('Cancel')}
                            value={this.excludedFor(giver.id)}
                            onIonChange={(event: SelectCustomEvent<number[]>) =>
                                this.setExcluded(giver.id, event.detail.value ?? [])
                            }
                        >
                            {members
                                .filter(receiver => receiver.id !== giver.id)
                                .map(receiver => (
                                    <ion-select-option value={receiver.id}>
                                        {receiver.name}
                                    </ion-select-option>
                                ))}
                        </ion-select>
                    </ion-item>
                ))}
            </ion-list>
        );
    };
}
