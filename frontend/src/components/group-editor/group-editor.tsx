import { Component, Fragment, h, Prop, State } from '@stencil/core';
import {
    CheckboxCustomEvent,
    InputCustomEvent,
    modalController,
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
            const input = { name, personIds: this.selectedIds };
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
}
