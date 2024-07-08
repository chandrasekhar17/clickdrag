import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../../shared/constants/appconfig';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    constructor(private translate: TranslateService) { }

    async loadTranslations() {
        const translationKeys = [
            'EDIT',
            'ADD_LABEL_BELOW',
            'MARK_AS_DISTRACTOR',
            'ADD_DROPZONE',
            'DELETE',
            'MODAL_POPUP_MESSAGE_ON_DELETE_FOR_LABEL',
            'MODAL_POPUP_MESSAGE_ON_DELETE_FOR_DISTRACTOR',
            'MODAL_POPUP_MESSAGE_ON_DELETE_FOR_LABEL_FOR_GROUPING',
            'DELETE_CONFIRMATION_LABEL',
            'DELETE_CONFIRMATION_DISTRACTOR',
            'GROUP_EDITOR_PLACEHOLDER',
            'DROPZONE_EDITOR_PLACEHOLDER',
            'FEEDBACK_EDITOR_PLACEHOLDER',
            'LABEL_EDITOR_PLACEHOLDER',
            'NOTE_EDITOR_PLACEHOLDER',
            'MARK_AS_LABEL',
        ];

        const translations = await this.translate.get(translationKeys).toPromise();
        APP_CONFIG.LABEL_OPTIONS.EDIT = translations['EDIT'];
        APP_CONFIG.LABEL_OPTIONS.ADD_LABEL_BELOW = translations['ADD_LABEL_BELOW'];
        APP_CONFIG.LABEL_OPTIONS.MARK_AS_DISTRACTOR = translations['MARK_AS_DISTRACTOR'];
        APP_CONFIG.LABEL_OPTIONS.ADD_DROPZONE = translations['ADD_DROPZONE'];
        APP_CONFIG.LABEL_OPTIONS.DELETE = translations['DELETE'];
        APP_CONFIG.LABEL_OPTIONS.MARK_AS_LABEL = translations['MARK_AS_LABEL'];
        APP_CONFIG.DISTRACTOR_OPTIONS.EDIT = translations['EDIT'];
        APP_CONFIG.DISTRACTOR_OPTIONS.ADD_LABEL_BELOW = translations['ADD_LABEL_BELOW'];
        APP_CONFIG.DISTRACTOR_OPTIONS.MARK_AS_LABEL = translations['MARK_AS_LABEL'];
        APP_CONFIG.DISTRACTOR_OPTIONS.DELETE = translations['DELETE'];
        APP_CONFIG.NEW_LABEL_OPTIONS.EDIT = translations['EDIT'];
        APP_CONFIG.NEW_LABEL_OPTIONS.ADD_LABEL_BELOW = translations['ADD_LABEL_BELOW'];
        APP_CONFIG.NEW_LABEL_OPTIONS.MARK_AS_DISTRACTOR = translations['MARK_AS_DISTRACTOR'];
        APP_CONFIG.NEW_LABEL_OPTIONS.DELETE = translations['DELETE']

        APP_CONFIG.MODAL_POPUP_MESSAGE_ON_DELETE_FOR_LABEL = translations['MODAL_POPUP_MESSAGE_ON_DELETE_FOR_LABEL'];
        APP_CONFIG.MODAL_POPUP_MESSAGE_ON_DELETE_FOR_DISTRACTOR = translations['MODAL_POPUP_MESSAGE_ON_DELETE_FOR_DISTRACTOR'];
        APP_CONFIG.MODAL_POPUP_MESSAGE_ON_DELETE_FOR_LABEL_FOR_GROUPING = translations['MODAL_POPUP_MESSAGE_ON_DELETE_FOR_LABEL_FOR_GROUPING'];
        APP_CONFIG.DELETE_CONFIRMATION_LABEL = translations['DELETE_CONFIRMATION_LABEL'];
        APP_CONFIG.DELETE_CONFIRMATION_DISTRACTOR = translations['DELETE_CONFIRMATION_DISTRACTOR'];

        APP_CONFIG.GROUP_EDITOR_PLACEHOLDER = translations['GROUP_EDITOR_PLACEHOLDER'];
        APP_CONFIG.DROPZONE_EDITOR_PLACEHOLDER = translations['DROPZONE_EDITOR_PLACEHOLDER'];
        APP_CONFIG.FEEDBACK_EDITOR_PLACEHOLDER = translations['FEEDBACK_EDITOR_PLACEHOLDER'];
        APP_CONFIG.LABEL_EDITOR_PLACEHOLDER = translations['LABEL_EDITOR_PLACEHOLDER'];
        APP_CONFIG.NOTE_EDITOR_PLACEHOLDER = translations['NOTE_EDITOR_PLACEHOLDER'];
    }
}
