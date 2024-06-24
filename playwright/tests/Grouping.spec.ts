import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { EZT_PO } from "../PageObjectModel/EZT_PO"
import { Activity_PO } from "../PageObjectModel/Activity_PO"
import * as data from '../Data/ErrMsg.json'
import { parse } from 'csv-parse/sync';
import { TestMode_PO } from "../PageObjectModel/TestMode_PO";
test.describe('Grouping', () => {
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        skip_empty_lines: true
    });
    let frame: any = null;
    test.beforeEach(async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
        await ezt_po.LoadAPI()
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    })
    test('By default 2 groups and add new group option should be available to the author. ', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await expect(frame.locator('div.single-drop-zone')).toHaveCount(2);
        await expect(frame.locator('div.label-text-box')).toHaveCount(2);
        await expect(frame.locator('text=Add Group')).toBeVisible();
    });
    test('Author should be able to add up to a total of 6 groups', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        for (let i = 0; i <= 3; i++) {
            await frame.locator('text=Add Group').click();
        }
        await expect(frame.locator('text=Add Group')).not.toBeVisible();
        await expect(frame.locator('div.single-drop-zone')).toHaveCount(6);

    });
    test('Author should not be allowed to use the same image for different groups. ', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Image').nth(0).click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        await frame.locator('text=Add Image').nth(0).click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        const title = await frame.locator('h2.modal-title');
        await expect(title).toHaveText(' Duplicate Images Found ');
        const ErrorMsg = await frame.locator('.modal-content-text.ng-star-inserted');
        await expect(ErrorMsg).toHaveText('The selected image has already been used for another group.');
        await frame.locator('text=OK').click();
        await expect(frame.locator('h2.modal-title')).toHaveText(' Add Image ');
        await frame.locator('div.media').nth(1).click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        await expect(frame.locator('img.media-image')).toHaveCount(2)
    });
    test('Author should able to see error message on no media added to question', async ({ page }) => {
        await page.locator('#ext_012345678_itemmedia').press('Control+a');
        await page.locator('#ext_012345678_itemmedia').fill('');
        const ezt_po = new EZT_PO(page);
        await ezt_po.LoadAPI()
        const activity = new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Image').first().click();
        await expect(frame.locator('.modal-content-text.ng-star-inserted')).toHaveText(data.NoImageMsg)
        await frame.locator('text= Ok ').click();
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await frame.locator('text=Edit').click();
        await frame.locator('div[role="dialog"] >> text=Add Image').click();
        await expect(frame.locator('div.media-msg-body')).toHaveText(data.NoImgMsg);
        await frame.locator('[aria-label="Back"]').click();
        await expect(frame.locator('text=Edit Label')).toBeVisible();

    });
    test('On click of Reset all will remove label from dropzone', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex = i;
            let DropzoneIndex = i;
            if (i === 0 || i === 1 || i === 2) { DropzoneIndex = 0 }
            if (i === 3 || i === 4) { DropzoneIndex = 1 }
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }

        await frame.locator('text=Reset All').click();
        await frame.locator('text=Cancel').click();
        await expect(frame.locator('div.labelContainer').nth(3)).toBeVisible();
        await frame.locator('text=Reset All').click();
        await frame.locator('text=OK').click();
        await expect(frame.locator('div.labelContainer')).not.toBeVisible();
    });
    test('Warning message on deleting Group', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Group').click();
        await frame.locator('#dropzone_1 div').click();
        await frame.locator('[aria-label="Delete"]').click();
        await expect(frame.locator('.modal-content-text')).toHaveText(data.GroupDelete)
        await frame.locator('text=Cancel').click();
        await expect(frame.locator('div.single-drop-zone')).toHaveCount(3)
        await frame.locator('#dropzone_1 div').click();
        await frame.locator('[aria-label="Delete"]').click();
        await frame.locator('text=Ok').click();
        await expect(frame.locator('div.single-drop-zone')).toHaveCount(2)
    });
    test('Delete should be disabled for bydefault 2 groups', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('#dropzone_1 div').click();
        expect(await frame.locator('[aria-label="Delete"]')).not.toBeEnabled();
        await frame.locator('#dropzone_2 div').click();
        expect(await frame.locator('[aria-label="Delete"]')).not.toBeEnabled();
    });
    test('When author selects any label and click on "Delete" in kebab, They should get a warning/confirmation popup ', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('text=Add Label Below').click();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('ul[role="listbox"] >> text=Delete').click();
        await frame.locator('text=Cancel').click();
        var labelCount = frame.locator('text=Add Label Text');
        await expect(labelCount).toHaveCount(3)
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('ul[role="listbox"] >> text=Delete').click();
        const errorMessage = await frame.locator('.modal-content-text')
        await expect(errorMessage).toContainText(data.GrpDeleteLabel)
        frame.locator('text=Ok').click();
        var labelCount = frame.locator('text=Add Label Text');
        await expect(labelCount).toHaveCount(2)

    });
    test('When author selects any distractor and click on "Delete" kebab option, They should get a warning/confirmation popup ', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Label Textlabel = more optionAdd Label Textlabel = more option >> button').first().click();
        await frame.locator('text=Add Label Below').click();
        await frame.locator('text=Add Label Textlabel = more optionAdd Label Textlabel = more optionAdd Label Text >> button').first().click();
        await frame.locator('text=Add Label Textlabel = more optionAdd Label Textlabel = more optionAdd Label Text >> button').first().click();
        await frame.locator('text=Mark as Distractor').click();
        await frame.locator('text=Add Distractor Textlabel = more option >> button').click();
        await frame.locator('ul[role="listbox"] >> text=Delete').click();
        await frame.locator('text=Cancel').click();
        await frame.locator('text=Add Distractor Textlabel = more option >> button').click();
        await frame.locator('ul[role="listbox"] >> text=Delete').click();
        const errorMessage = await frame.locator('.modal-content-text')
        await expect(errorMessage).toContainText(data.DeleteDistractor)
        await frame.locator('text=Ok').click();

    });
});
test.describe('Grouping As an Author, I should be able to create maximum of 20 labels or distractors ', () => {
    let frame: any = null;
    test.beforeEach(async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
        await ezt_po.LoadAPI()
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    })
    test('Grouping- One Label to One Dock', async ({ page }) => {
        const activity = new Activity_PO(page);
        activity.GroupingOneLabelOneDock();

    });
    test('Grouping- One Label to Multiple Dock-Display Label Once', async ({ page }) => {
        const activity = new Activity_PO(page);
        activity.GroupingDisplayLabelOnce();
    });
    test('Grouping- One Label to Multiple Dock-Display Each Label Instance', async ({ page }) => {
        const activity = new Activity_PO(page);
        activity.GroupingEachLabelInstance();
    });
    test.afterEach(async ({ page }) => {
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 17; i++) {
            await frame.locator('.ahe-icon-system-kebab').first().click();
            await frame.locator('text=Add Label Below').click();
            await frame.locator('.ahe-icon-system-kebab').first().click();
        }
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await expect(frame.locator('ul>li').nth(1)).toHaveAttribute('aria-disabled', 'true');

        const count = await frame.locator('div.label-text-box');
        await expect(count).toHaveCount(20);

        await frame.locator('button:has-text("accordion-close")').click();
        const canvasheight = await frame.locator('#canvas-height');
        await expect(canvasheight).toHaveValue('650')
    });
});
