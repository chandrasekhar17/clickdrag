import { test, expect } from '@playwright/test';
import { EZT_PO } from "../PageObjectModel/EZT_PO"
import { Activity_PO } from "../PageObjectModel/Activity_PO"
import * as data from '../Data/ErrMsg.json'
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { TestMode_PO } from "../PageObjectModel/TestMode_PO";
test.describe('Image Labeling-As an Author, I should be able to create maximum of 20 labels or distractors ', () => {
    let frame: any = null;
    test.beforeEach(async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
        await ezt_po.LoadAPI()
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    })
    test('Image Labeling- One Label to One Dock', async ({ page }) => {
        const activity = new Activity_PO(page);
        activity.ImageOneLabelToOneDock();
    });
    test('Image Labeling- One Label to Multiple Dock-Display Label Once', async ({ page }) => {
        const activity = new Activity_PO(page);
        activity.ImageDisplayLabelOnce();
    });
    test('Image Labeling- One Label to Multiple Dock-Display Each Label Instance', async ({ page }) => {
        const activity = new Activity_PO(page);
        activity.ImageDisplayEachLabelInstance();
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
        await expect(canvasheight).toHaveValue('1700')
    });
});
test.describe('Image Labeling', () => {
    let frame: any = null;
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        skip_empty_lines: true
    });
    test.beforeEach(async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
        await ezt_po.LoadAPI()
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');

    });
    test('When author selects any label and click on "Delete" in kebab, They should get a warning/confirmation popup ', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.ImageOneLabelToOneDock();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('text=Add Label Below').click();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('ul[role="listbox"] >> text=Delete').click();
        await frame.locator('text=Cancel').click();
        var dropzoneCount = frame.locator('div.dropzone-text');
        await expect(dropzoneCount).toHaveCount(3)
        var labelCount = frame.locator('text=Add Label Text');
        await expect(labelCount).toHaveCount(3)
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('ul[role="listbox"] >> text=Delete').click();
        const errorMessage = await frame.locator('.modal-content-text')
        await expect(errorMessage).toContainText(data.ImgDeleteLabel)
        frame.locator('text=Ok').click();
        var dropzoneCount = frame.locator('div.dropzone-text');
        await expect(dropzoneCount).toHaveCount(2)
        var labelCount = frame.locator('text=Add Label Text');
        await expect(labelCount).toHaveCount(2)

    });
    test('When Author selects a dock and click "Delete" from the header, The docks and the corresponding label has to be deleted.', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.ImageOneLabelToOneDock();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('text=Add Label Below').click();
        await frame.locator('rect:nth-child(3)').first().click();
        await frame.locator('[aria-label="Delete"]').click();
        const errorMessage = await frame.locator('.modal-content-text')
        await expect(errorMessage).toContainText(data.ImgDeleteDock)
        frame.locator('text=Cancel').click();
        var dropzoneCount = frame.locator('div.dropzone-text');
        await expect(dropzoneCount).toHaveCount(3)
        var labelCount = frame.locator('text=Add Label Text');
        await expect(labelCount).toHaveCount(3)
        await frame.locator('rect:nth-child(3)').first().click();
        await frame.locator('[aria-label="Delete"]').click();
        await frame.locator('text=Ok').click();
        var dropzoneCount = frame.locator('div.dropzone-text');
        await expect(dropzoneCount).toHaveCount(2)
        var labelCount = frame.locator('text=Add Label Text');
        await expect(labelCount).toHaveCount(2)
    });
    test('When author selects any distractor and click on "Delete" kebab option, They should get a warning/confirmation popup ', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.ImageOneLabelToOneDock();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('text=Add Label Below').click();
        await frame.locator('[mhetooltip="Options"]').first().click();
        await frame.locator('[mhetooltip="Options"]').first().click();
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

    test('When author selects the background image and click "Delete" icon on the header, They should get a warning/confirmation popup.', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.ImageOneLabelToOneDock();
        await frame.locator('text=Add Image').click();
        await frame.locator('button:has-text("Add")').click();
        await frame.locator('image').click({ timeout: 3000 });
        await frame.locator('[aria-label="Delete"]').click();
        const errorMessage = await frame.locator('.modal-content-text')
        await expect(errorMessage).toContainText(data.ImgDeleteBackgrdImage)
        await frame.locator('text=Cancel').click();
        const backgroundImage = await frame.locator("image");
        await expect(backgroundImage).toHaveAttribute("xlink:href", "./assets/Earth.jpg");
        await frame.locator('image').click();
        await frame.locator('image').click();
        await frame.locator('[aria-label="Delete"]').click();
        await frame.locator('text=Ok').click();
        const container = await frame.locator('text=Add the background image')
        await expect(container).toContainText("Add the background image")


    });
    test.skip('leaderline', async ({ page }) => {
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await frame.locator('text=Start').click();
        await frame.locator('text=Add Image').click();
        await frame.locator('button:has-text("Add")').click();
        await frame.locator('g:nth-child(2) g rect:nth-child(3)').click();
        await frame.locator('[fill="#007c91"]').nth(3).click();
        await frame.locator('g:nth-child(3) g rect:nth-child(3)').click();
        await frame.locator('[fill="#007c91"]').nth(3).click();


    });
    test('Image- Author should able to see error message on no media added to question', async ({ page }) => {
        await page.locator('#ext_012345678_itemmedia').press('Control+a');
        await page.locator('#ext_012345678_itemmedia').fill('');
        const ezt_po = new EZT_PO(page);
        await ezt_po.LoadAPI()
        const activity= new Activity_PO(page);
        await activity.ImageOneLabelToOneDock();
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
    test('Image-On click of Reset all will remove label from dropzone', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[1].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 3; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }

        await frame.locator('text=Reset All').click();
        await frame.locator('text=Cancel').click();
        await expect(frame.locator('app-shared-single-label').nth(8)).toBeVisible();
        await frame.locator('text=Reset All').click();
        await frame.locator('text=OK').click();
        await expect(frame.locator('app-shared-single-label').nth(8)).not.toBeVisible();
    });

});
test.describe('Author able to create maximum 5 dropzone', () => {
    let frame: any = null;
    test.beforeEach(async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
        await ezt_po.LoadAPI()
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');

    });
    test('Image Labeling-> Display Label once able to create 5 dropzone per label', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.ImageDisplayLabelOnce();
        for (let i = 0; i <= 4; i++) {
            await frame.locator('[mhetooltip="Options"]').first().click();
            await frame.locator('text=Add Drop zone').click();
            await frame.locator('[mhetooltip="Options"]').first().click();
        }

        await frame.locator('[mhetooltip="Options"]').first().click();
        await expect(frame.locator('text=Add Drop zone')).not.toHaveProperty('aria-disabled','true')
        await expect(frame.locator('[fill="transparent"]')).toHaveCount(6)

    });
    test('Image Labeling-> Each Label Instance able to create 5 dropzone per label', async ({ page }) => {
        const activity = new Activity_PO(page);
        await activity.ImageDisplayEachLabelInstance();
        for (let i = 0; i <= 4; i++) {
            await frame.locator('[mhetooltip="Options"]').first().click();
            await frame.locator('text=Add Drop zone').click();
            await frame.locator('[mhetooltip="Options"]').first().click();
        }

        await frame.locator('[mhetooltip="Options"]').first().click();
        await expect(frame.locator('text=Add Drop zone')).not.toHaveProperty('aria-disabled','true')
        await expect(frame.locator('[fill="transparent"]')).toHaveCount(6)
    });



});


