import { Component, Fragment, h, Prop, State } from '@stencil/core';
import { InputCustomEvent, modalController } from '@ionic/core';
import * as models from '../../models';
import { BackendClient } from '../../services/backendClient';
import { DEFAULT_PROFILE_PICTURE } from '../../config';
import { t } from '../../i18n';
import { errorMessage } from '../../utils/ui';

@Component({
    tag: 'person-editor',
    styleUrl: 'person-editor.scss',
})
export class PersonEditor {
    /** The person to edit. Leave out to create a new person. */
    @Prop() person?: models.Person;

    @State() private name = '';
    @State() private pictureUrl = '';
    @State() private isSaving = false;
    @State() private error: string | null = null;

    public componentWillLoad(): void {
        this.name = this.person?.name ?? '';
        this.pictureUrl = this.person?.pictureUrl ?? '';
    }

    private save = async (event?: Event): Promise<void> => {
        event?.preventDefault();
        const name = this.name.trim();
        const pictureUrl = this.pictureUrl.trim();
        if (!name) {
            this.error = t('Name is required');
            return;
        }

        this.isSaving = true;
        this.error = null;
        try {
            const client = BackendClient.GetInstance();
            const saved = this.person
                ? await client.UpdatePerson(this.person.id, {
                      name,
                      pictureUrl: pictureUrl || null,
                  })
                : await client.CreatePerson(
                      pictureUrl ? { name, pictureUrl } : { name }
                  );
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
                            {this.person ? t('Edit person') : t('New person')}
                        </ion-title>
                        <ion-buttons slot="end">
                            <ion-button
                                strong
                                disabled={this.isSaving}
                                onClick={() => this.save()}
                            >
                                {t('Save')}
                            </ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <form onSubmit={this.save}>
                        <ion-avatar class="preview">
                            <img
                                alt={t('Profile picture of {name}', {
                                    name: this.name,
                                })}
                                src={
                                    this.pictureUrl.trim() ||
                                    DEFAULT_PROFILE_PICTURE
                                }
                            />
                        </ion-avatar>
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
                            <ion-item>
                                <ion-input
                                    label={t('Picture URL')}
                                    labelPlacement="stacked"
                                    placeholder="/assets/profiles/name.jpg"
                                    helperText={t(
                                        'Leave empty to use the default picture'
                                    )}
                                    value={this.pictureUrl}
                                    onIonInput={(event: InputCustomEvent) =>
                                        (this.pictureUrl =
                                            event.detail.value ?? '')
                                    }
                                />
                            </ion-item>
                        </ion-list>
                        {this.error && (
                            <ion-text color="danger">
                                <p>{this.error}</p>
                            </ion-text>
                        )}
                        {/* Lets Enter submit the form. */}
                        <input type="submit" hidden />
                    </form>
                </ion-content>
            </Fragment>
        );
    }
}
