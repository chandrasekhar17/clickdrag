import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import * as data from '../Data/Conversion.json';
import { EZT_PO } from "../PageObjectModel/EZT_PO"
import { Activity_PO } from "../PageObjectModel/Activity_PO"
import { CreateMode_PO } from "../PageObjectModel/CreateMode_PO"
import { timeout } from 'rxjs/operators';
test.describe('Image Labeling One Label to One Dock ', () => {
    let frame: any = null;
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        relax_quotes: true,
        skip_empty_lines: true,
        relax_column_count: true

    });
    test.beforeEach(async ({ page }) => {
        //await page.goto('testrig.html');
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    })
    test('Labels should be disabled and distractor enabled in label section', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[0].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput()
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        for (let i = 0; i <= 5; i++) {
            if (i <= 3) {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'true');
            } else {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'false');
            }
        }
    })
    test('Verify Long Image Description', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[0].states)
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        await frame.locator('text=Image Description').click();
        const LongDesc=await frame.locator('p.modal-content-text')
        expect(LongDesc).toContainText('LD 2 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tem');
        await frame.locator('text=Close').click();
    })
    test('No of Drop zones and All Drop zones with correct answers filled should be displayed as defined by the author', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[0].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        await expect(frame.locator('div.canvas-media')).toBeVisible();
        await expect(frame.locator('div.drop-zone')).toHaveCount(4)
        const PreviewdropzoneText = await frame.locator('.drop-zone__text');
        await expect(PreviewdropzoneText).toContainText(["Right Brain", "Left Brain", "Lungs", "Kidney"])

    });
    test('Notes Icon must be displayed next to it in the Labels section if added by Author. The note must get opened on click of the icon. ', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[0].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        for (let i = 0; i <= 3; i++) {
            const note = await frame.locator('.dpg-icon-notepad').nth(i);
            await expect(note).toBeVisible();
            const NoteContent = await frame.locator('div.popover-body p').nth(i);
            if (i === 0) {
                await note.click();
                await expect(NoteContent).toHaveText('Brain')
            }
            if (i === 1) {
                await note.click();
                await expect(NoteContent).toHaveText('Right Brain')
            }
        }
    });
    test('When Leader lines are available, the Image Preview box to show the Zoomed in view of the image must be shown in Preview mode on click/focus or hover of the drop zone.', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[0].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        await page.mouse.move(150, 156)
        await expect(frame.locator('app-magnify-preview')).toHaveAttribute('style','top: 182px; left: 450px; width: 200px; height: 200px;')
    });
})
test.describe('Image Labeling Display Label Once ', () => {
    let frame: any = null;
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        relax_quotes: true,
        skip_empty_lines: true,
        relax_column_count: true

    });
    test.beforeEach(async ({ page }) => {
        //await page.goto('testrig.html');
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    })
    test('All Labels are displayed in the Labels section and enabled', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[2].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        for (let i = 0; i <= 3; i++) {
            await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'false');
        }
    })
    test('No of Drop zones and All Drop zones with correct answers filled should be displayed as defined by the author', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[2].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        await expect(frame.locator('div.canvas-media')).toBeVisible();
        await expect(frame.locator('div.drop-zone')).toHaveCount(5)
        const PreviewdropzoneText = await frame.locator('.drop-zone__text');
        await expect(PreviewdropzoneText).toContainText(["Brain", "Brain", "Lungs", "Hand", "Hand"])

    });
    test('Notes Icon must be displayed next to it in the Labels section if added by Author. The note must get opened on click of the icon. ', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[2].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        for (let i = 0; i <= 2; i++) {
            const note = await frame.locator('.dpg-icon-notepad').nth(i);
            await expect(note).toBeVisible();
            const NoteContent = await frame.locator('div.popover-body p').nth(i);
            if (i === 0) {
                await note.click();
                await expect(NoteContent).toHaveText('Left or Right Brain')
            }
            if (i === 1) {
                await note.click();
                await expect(NoteContent).toHaveText('Lungs-Left or Right Lung')
            }
        }
    });
    test('When Leader lines are available, the Image Preview box to show the Zoomed in view of the image must be shown in Preview mode on click/focus or hover of the drop zone.', async ({ page }) => {
    });
    test('Verify Short and Long Image Description', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[10].states);
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        await expect(frame.locator('[alt="Edited Short Description"]')).toBeVisible();
        await frame.locator('text=Image Description').click();
        const LongDesc=await frame.locator('p.modal-content-text')
        expect(LongDesc).toContainText('Edited Long Description');
        await frame.locator('text=Close').click();
    })
})
test.describe('Image Labeling Each Label Instance', () => {
    let frame: any = null;
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        relax_quotes: true,
        skip_empty_lines: true,
        relax_column_count: true

    });
    test.beforeEach(async ({ page }) => {
        //await page.goto('testrig.html');
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    })
    test('All Labels are displayed in the Labels section and enabled', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[3].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        for (let i = 0; i <= 5; i++) {
            if (i <= 4) {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'true');
            } else {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'false');
            }
        }
    })
    test('No of Drop zones and All Drop zones with correct answers filled should be displayed as defined by the author', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[3].states)
        await ezt_po.LoadAPI()
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        await expect(frame.locator('div.canvas-media')).toBeVisible();
        await expect(frame.locator('div.drop-zone')).toHaveCount(5)
        const PreviewdropzoneText = await frame.locator('.drop-zone__text');
        await expect(PreviewdropzoneText).toContainText(["Brain", "Brain", "Kidneys", "Leg", "Leg"])

    });
    test('Notes Icon must be displayed next to it in the Labels section if added by Author. The note must get opened on click of the icon. ', async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        const createmode_po = new CreateMode_PO(page);
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        await ezt_po.InputState(records[3].states)
        await page.locator('select[name="mode_select"]').selectOption('preview');
        await ezt_po.LoadAPI()
        for (let i = 0; i <= 1; i++) {
            const note = await frame.locator('i.dpg-icon-notepad').nth(i);
            await expect(note).toBeVisible();
            const NoteContent = await frame.locator('div.popover-body p').nth(i);
            if (i === 0||i===1) {
                await note.click();
                await expect(NoteContent).toHaveText('Left or Right Brain')
            }
        }
    });
    test('When Leader lines are available, the Image Preview box to show the Zoomed in view of the image must be shown in Preview mode on click/focus or hover of the drop zone.', async ({ page }) => {
    });
})

