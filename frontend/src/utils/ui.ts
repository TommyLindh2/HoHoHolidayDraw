import {
    alertController,
    modalController,
    toastController,
} from '@ionic/core';
import * as models from '../models';
import { BackendClient } from '../services/backendClient';
import { t } from '../i18n';

const client = (): BackendClient => BackendClient.GetInstance();

export function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function showToast(
    message: string,
    color: 'danger' | 'success' = 'success'
): Promise<void> {
    const toast = await toastController.create({
        message,
        color,
        duration: color === 'danger' ? 4000 : 1500,
        position: 'top',
    });
    await toast.present();
}

export const showError = (error: unknown): Promise<void> =>
    showToast(t('Something went wrong: {message}', { message: errorMessage(error) }), 'danger');

export async function navigate(
    url: string,
    direction: 'forward' | 'back' = 'forward'
): Promise<void> {
    await document.querySelector('ion-router')?.push(url, direction);
}

async function confirm(header: string, message: string): Promise<boolean> {
    const alert = await alertController.create({
        header,
        message,
        buttons: [
            { text: t('Cancel'), role: 'cancel' },
            { text: t('Delete'), role: 'destructive' },
        ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'destructive';
}

async function openEditor(
    component: 'person-editor' | 'group-editor',
    componentProps: Record<string, unknown>
): Promise<void> {
    const modal = await modalController.create({ component, componentProps });
    await modal.present();
    await modal.onDidDismiss();
}

/** Opens the person editor. Leave `person` out to create a new one. */
export const editPerson = (person?: models.Person): Promise<void> =>
    openEditor('person-editor', { person });

/** Opens the group editor. Leave `group` out to create a new one. */
export const editGroup = (group?: models.Group): Promise<void> =>
    openEditor('group-editor', { group });

/** Asks for confirmation first. Returns true if the person was deleted. */
export async function deletePerson(person: models.Person): Promise<boolean> {
    const confirmed = await confirm(
        t('Delete {name}?', { name: person.name }),
        t('{name} will also be removed from all groups.', { name: person.name })
    );
    if (!confirmed) {
        return false;
    }
    try {
        await client().DeletePerson(person.id);
        return true;
    } catch (error) {
        await showError(error);
        return false;
    }
}

/** Asks for confirmation first. Returns true if the group was deleted. */
export async function deleteGroup(group: models.Group): Promise<boolean> {
    const confirmed = await confirm(
        t('Delete {name}?', { name: group.name }),
        t('The persons in the group are kept.')
    );
    if (!confirmed) {
        return false;
    }
    try {
        await client().DeleteGroup(group.id);
        return true;
    } catch (error) {
        await showError(error);
        return false;
    }
}
