import { Component, Fragment, h, Listen, Prop, State } from '@stencil/core';
import * as models from '../../models';
import { BackendClient } from '../../services/backendClient';
import { DEFAULT_PROFILE_PICTURE } from '../../config';
import { t } from '../../i18n';
import { deletePerson, editPerson, navigate, showError } from '../../utils/ui';

@Component({
    tag: 'page-profile',
    styleUrl: 'page-profile.scss',
    shadow: true,
})
export class PageProfile {
    @Prop() personId: number;
    @State() isLoading: boolean = true;
    @State() person: models.Person = null;
    @State() groups: models.Group[] = [];

    private get client(): BackendClient {
        return BackendClient.GetInstance();
    }

    public componentDidLoad(): Promise<void> {
        return this.load();
    }

    // Stencil needs a literal here; keep in sync with DATA_CHANGED_EVENT.
    @Listen('hhdDataChanged', { target: 'window' })
    public async load(): Promise<void> {
        try {
            const [person, groups] = await Promise.all([
                this.client.GetPersonById(this.personId),
                this.client.GetGroups(),
            ]);
            this.person = person;
            this.groups = groups.filter(g => g.personIds.includes(person.id));
        } catch (error) {
            // The person is gone after a delete, nothing to show then.
            if (this.person) {
                await showError(error);
            }
        } finally {
            this.isLoading = false;
        }
    }

    private delete = async (): Promise<void> => {
        if (this.person && (await deletePerson(this.person))) {
            this.person = null;
            await navigate('/tab/person', 'back');
        }
    };

    public render() {
        return (
            <Fragment>
                {this.renderHeader()}
                {this.renderContent()}
                {this.renderLoader()}
            </Fragment>
        );
    }

    private renderContent = () => {
        if (this.isLoading) {
            return;
        }

        return (
            <ion-content fullscreen class="ion-padding">
                <ion-card>
                    <ion-card-header>
                        {this.renderPicture()}
                        <h1>{this.person?.name}</h1>
                    </ion-card-header>

                    <ion-card-content>
                        <h2>{t('Member of')}</h2>
                        {this.groups.length ? (
                            <div>
                                {this.groups.map(group => (
                                    <ion-chip key={group.id}>
                                        <ion-icon name="people-outline" />
                                        <ion-label>{group.name}</ion-label>
                                    </ion-chip>
                                ))}
                            </div>
                        ) : (
                            <p>{t('Not a member of any group')}</p>
                        )}
                    </ion-card-content>
                </ion-card>
            </ion-content>
        );
    };

    private renderPicture = () => {
        const pictureUrl = this.person?.pictureUrl || DEFAULT_PROFILE_PICTURE;

        return (
            <ion-avatar>
                <img
                    alt={t('Profile picture of {name}', {
                        name: this.person?.name ?? '',
                    })}
                    src={pictureUrl}
                />
            </ion-avatar>
        );
    };

    private renderHeader = () => {
        return (
            <ion-header>
                <ion-toolbar color="primary">
                    <ion-buttons slot="start">
                        <ion-back-button defaultHref="/tab/person"></ion-back-button>
                    </ion-buttons>
                    <ion-title>
                        {t('Profile: {name}', { name: this.person?.name ?? '' })}
                    </ion-title>
                    <ion-buttons slot="end">
                        <ion-button
                            title={t('Edit')}
                            disabled={!this.person}
                            onClick={() => editPerson(this.person)}
                        >
                            <ion-icon slot="icon-only" name="create-outline" />
                        </ion-button>
                        <ion-button
                            title={t('Delete')}
                            disabled={!this.person}
                            onClick={this.delete}
                        >
                            <ion-icon slot="icon-only" name="trash-outline" />
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
        );
    };

    private renderLoader = () => {
        if (!this.isLoading) {
            return;
        }

        return <ion-skeleton-text animated />;
    };
}
