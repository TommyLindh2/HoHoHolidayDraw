import { Component, Fragment, h, Listen, State } from '@stencil/core';
import { BackendClient } from '../../../services/backendClient';
import * as models from '../../../models';
import { t } from '../../../i18n';
import {
    deleteGroup,
    editGroup,
    navigate,
    showError,
} from '../../../utils/ui';

@Component({
    tag: 'page-group-list',
    styleUrl: 'page-group-list.scss',
    // shadow: true,
})
export class PageGroupList {
    @State()
    private groups: models.Group[] = [];

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
            this.groups = await this.client.GetGroups();
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
                        <ion-title>{t('Group to draw')}</ion-title>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    {this.renderLoader()}
                    {this.renderGroupList()}
                    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
                        <ion-fab-button
                            title={t('New group')}
                            onClick={() => editGroup()}
                        >
                            <ion-icon name="add" />
                        </ion-fab-button>
                    </ion-fab>
                </ion-content>
            </Fragment>
        );
    }

    private renderGroupList = () => {
        if (this.isLoading) {
            return;
        }

        if (this.groups.length === 0) {
            return (
                <p class="empty">
                    {t('No groups yet. Add one with the + button.')}
                </p>
            );
        }

        return <ion-list>{this.groups.map(this.renderItem)}</ion-list>;
    };

    private renderLoader = () => {
        if (!this.isLoading) {
            return;
        }

        return <ion-spinner name="dots"></ion-spinner>;
    };

    private renderItem = (group: models.Group) => {
        // Run an action without also navigating to the draw page.
        const only = (action: () => unknown) => (event: Event) => {
            event.stopPropagation();
            action();
        };

        return (
            <ion-item
                button
                detail={false}
                key={group.id}
                onClick={() => navigate(`/draw/${group.id}`)}
            >
                <ion-icon name="people-outline" slot="start" />
                <ion-label>
                    <h2>{group.name}</h2>
                    <p>
                        {t('{count} persons', {
                            count: group.personIds.length,
                        })}
                    </p>
                </ion-label>
                <ion-button
                    slot="end"
                    fill="clear"
                    title={t('Edit')}
                    onClick={only(() => editGroup(group))}
                >
                    <ion-icon slot="icon-only" name="create-outline" />
                </ion-button>
                <ion-button
                    slot="end"
                    fill="clear"
                    color="danger"
                    title={t('Delete')}
                    onClick={only(() => deleteGroup(group))}
                >
                    <ion-icon slot="icon-only" name="trash-outline" />
                </ion-button>
            </ion-item>
        );
    };
}
