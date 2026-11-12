import { Component, Fragment, h, Listen, State } from '@stencil/core';
import { BackendClient } from '../../../services/backendClient';
import * as models from '../../../models';
import { DEFAULT_PROFILE_PICTURE } from '../../../config';
import { t } from '../../../i18n';
import {
    deletePerson,
    editPerson,
    navigate,
    showError,
} from '../../../utils/ui';

@Component({
    tag: 'page-person-list',
    styleUrl: 'page-person-list.scss',
    // shadow: true,
})
export class PagePersonList {
    @State()
    private persons: models.Person[] = [];

    @State()
    private isLoading: boolean = true;

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
            this.persons = await this.client.GetPersons();
        } catch (error) {
            await showError(error);
        } finally {
            this.isLoading = false;
        }
    }

    public render() {
        return (
            <Fragment>
                <ion-header>
                    <ion-toolbar color="primary">
                        <ion-title>{t('Persons')}</ion-title>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    {this.renderLoader()}
                    {this.renderPersonList()}
                    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                        <ion-fab-button
                            title={t('New person')}
                            onClick={() => editPerson()}
                        >
                            <ion-icon name="person-add-outline" />
                        </ion-fab-button>
                    </ion-fab>
                </ion-content>
            </Fragment>
        );
    }

    private renderPersonList = () => {
        if (this.isLoading) {
            return;
        }

        if (this.persons.length === 0) {
            return (
                <p class="empty">
                    {t('No persons yet. Add one with the + button.')}
                </p>
            );
        }

        return <ion-list>{this.persons.map(this.renderItem)}</ion-list>;
    };

    private renderLoader = () => {
        if (!this.isLoading) {
            return;
        }

        return <ion-spinner name="dots"></ion-spinner>;
    };

    private renderItem = (person: models.Person) => {
        const pictureUrl = person?.pictureUrl || DEFAULT_PROFILE_PICTURE;
        // Run an action without also navigating to the profile page.
        const only = (action: () => unknown) => (event: Event) => {
            event.stopPropagation();
            action();
        };

        return (
            <ion-item
                button
                detail={false}
                key={person.id}
                onClick={() => navigate(`/profile/${person.id}`)}
            >
                <ion-avatar slot="start">
                    <img
                        alt={t('Profile picture of {name}', {
                            name: person.name,
                        })}
                        src={pictureUrl}
                    />
                </ion-avatar>
                <ion-label>{person.name}</ion-label>
                <ion-button
                    slot="end"
                    fill="clear"
                    title={t('Edit')}
                    onClick={only(() => editPerson(person))}
                >
                    <ion-icon slot="icon-only" name="create-outline" />
                </ion-button>
                <ion-button
                    slot="end"
                    fill="clear"
                    color="danger"
                    title={t('Delete')}
                    onClick={only(() => deletePerson(person))}
                >
                    <ion-icon slot="icon-only" name="trash-outline" />
                </ion-button>
            </ion-item>
        );
    };
}
