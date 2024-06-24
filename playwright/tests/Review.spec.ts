import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import { TestMode_PO } from "../PageObjectModel/TestMode_PO";
import { EZT_PO } from '../PageObjectModel/EZT_PO';
test.describe('Image Labeling', () => {
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        skip_empty_lines: true
    });
    test.beforeEach(async ({ page }) => {
        //await page.goto('testrig.html');
        let ezt_po = new EZT_PO(page);
        await ezt_po.visit();
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    })

    test('Label which is dropped disabled and distractor which is not dropped enabled', async ({ page }) => {
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
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 5; i++) {
            if (i <= 3) {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'true');
            } else {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'false');
            }
        }
    });
    test('Label which is not dropped enabled and distractor which is dropped disabled', async ({ page }) => {
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
        const src = await frame.locator('.label-box').nth(4);
        const dst = await frame.locator('.drop-zone.dropable').nth(1);
        let testmode = new TestMode_PO(page);
        await testmode.DragDrop(src, dst)
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        await expect(frame.locator('.label-box').nth(4)).toHaveAttribute('aria-disabled', 'true');
        await expect(frame.locator('.label-box').nth(1)).toHaveAttribute('aria-disabled', 'false');
    });
    test('All Drop zones with student answers filled should be displayed', async ({ page }) => {
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
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 3; i++) {
            const Dropzone = await frame.locator('.drop-zone.dropable').nth(i);
            if(i===0){await expect(Dropzone).toHaveText('Left Brain')}
            if(i===1){await expect(Dropzone).toHaveText('Right Brain')}
            if(i===2){await expect(Dropzone).toHaveText('Lungs')}
            if(i===3){await expect(Dropzone).toHaveText('Kidney')}
        }
    });
    test('The Feedback icon next to each label should be shown in Check my work mode.', async ({ page }) => {
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
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        const Notes = await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(1);
        await expect(Notes).toBeVisible();
    });
    test('Drop zone must be marked as the Correct if the label used by the student is the same label assigned by the author for that drop zone.', async ({ page }) => {
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
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 3; i++) {
            const Dropzone = await frame.locator('span.feedback-text').nth(i);
            await expect(Dropzone).toHaveText('Correct')
        }
    });
    test('Drop zone must be marked as the Incorrect if the label used by the student is different from the label assigned by the author for that drop zone.', async ({ page }) => {
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
        const src = await frame.locator('.label-box').nth(4);
        const dst = await frame.locator('.drop-zone.dropable').nth(1);
        let testmode = new TestMode_PO(page);
        await testmode.DragDrop(src, dst)
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        const Dropzone = await frame.locator('span.feedback-text').nth(1);
        await expect(Dropzone).toHaveText('Incorrect')
    });
    test('Drop zones that are left empty by students must marked as Incorrect ', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[1].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 2; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for(let j=0; j<=3; j++){
            await expect(frame.locator('span.feedback-text')).toHaveCount(4)

            if(j<=2){
            await expect(frame.locator('span.feedback-text').nth(j)).toHaveText('Correct')
            }
            if(j===3){
                await expect(frame.locator('span.feedback-text').nth(j)).toHaveText('Incorrect')
            }
        }

    });
    test('Image Labeling- Display Label once All Labels and Distractor are displayed in the Labels section and enabled', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[2].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let Labelindex = i;
            let DropzoneIndex = i;

            if (i === 1 || i === 2 || i === 3) { Labelindex = i - 1 }
            if (i === 4) { Labelindex = i - 2 }

            var src = await frame.locator('.label-box').nth(Labelindex);
            var dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 5; i++) {
            await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'false');
        }

    });
    test.skip('Image Labeling- Display Label Labels and Distractors UI must be shown as stacked ', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[2].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let Labelindex = i;
            let DropzoneIndex = i;

            if (i === 1 || i === 2 || i === 3) { Labelindex = i - 1 }
            if (i === 4) { Labelindex = i - 2 }

            var src = await frame.locator('.label-box').nth(Labelindex);
            var dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        //for (let i = 0; i <= 3; i++) {
        await expect(frame.locator('li.label-item').nth(1)).toHaveAttribute('class', 'label-stack')
        //}

    });
    test('Image Labeling-Display Each Label Instance The Labels/distractors which are dropped disabled and which are not dropped enabled in the labels section.  ', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[3].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 3; i++) {
            var src = await frame.locator('.label-box').nth(i);
            var dst = await frame.locator('.drop-zone.dropable').nth(i + 1);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 5; i++) {
            if (i <= 3) {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'true');
            } else {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'false');
            }
        }

    });
    test('Validating Feedback content and format', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[7].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 2; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 4; i++) {
            if (i === 0) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p')).toHaveAttribute('strong','')
                await expect(frame.locator('div.popover-body > p')).toHaveText('eft or Right Brain')
            }
            if (i === 1) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p > p')).toHaveAttribute('em','')
                await expect(frame.locator('div.popover-body > p > p')).toHaveText('Left or Right Lung')
            }
            if (i === 2) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p > p > span')).toHaveAttribute('style', 'text-decoration: underline;')
                await expect(frame.locator('div.popover-body > p > p > span')).toHaveText('Left or Right Leg')
            }
            if (i === 3) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p > p')).toHaveAttribute('sub','')
                await expect(frame.locator('div.popover-body > p > p')).toHaveText('1')
            }
            if (i === 4) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p > p')).toHaveAttribute('sup','')
                await expect(frame.locator('div.popover-body > p > p')).toHaveText('2')
            }
        }
    });
    test('Image Labeling-If any Label has more than one drop zone in Authoring mode, the count of the Label must be the same as the number of drop zones. ', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[3].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 3; i++) {
            var src = await frame.locator('.label-box').nth(i);
            var dst = await frame.locator('.drop-zone.dropable').nth(i + 1);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        await expect(frame.locator('div.label-box.text>p > p').nth(0)).toContainText('Brain')
        await expect(frame.locator('div.label-box.text>p > p').nth(1)).toContainText('Brain')
        await expect(frame.locator('div.label-box.text>p > p').nth(2)).toContainText('Leg')
        await expect(frame.locator('div.label-box.text>p > p').nth(3)).toContainText('Leg')
    });
    test('Image Labeling-Feedback policy set then display feedback icon', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[7].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 2; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await ezt_po.Feedback('');
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        await expect(frame.locator('i.dpg-icon-comment').nth(4)).not.toBeVisible();
        await ezt_po.Feedback('feedback');
        await ezt_po.LoadAPI();
        await expect(frame.locator('i.dpg-icon-comment').nth(4)).toBeVisible();
    });
    test('Image Labeling- verify image long description and short description', async ({ page }) => {
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
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        //alternative i need to check
        await expect(frame.locator('[alt="SD Human body"]')).toBeVisible();
        await frame.locator('text=Image Description').click();
        await expect(frame.locator('p.modal-content-text')).toContainText('LD 2 Lorem ipsum dolor sit amet, consectetur adipiscing elit,')
        await frame.locator('text= Close ').click();
    });

});
test.describe('Grouping', () => {
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        skip_empty_lines: true
    });
    test.beforeEach(async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.visit();
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    })
    test('Grouping-The Labels which are dropped disabled and distractor which is not dropped enabled in the labels section. ', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex = i;
            let DropzoneIndex = i;
            if (i === 0 || i === 2 || i === 3) { DropzoneIndex = 0 }
            if (i === 1 || i == 4) { DropzoneIndex = 1 }
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 6; i++) {
            if (i <= 4) {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'true');
            } else {
                await expect(frame.locator('.label-box').nth(i)).toHaveAttribute('aria-disabled', 'false');
            }
        }
    });
    test('Grouping-Label which is not dropped enabled and distractor which is dropped disabled', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 1; i <= 6; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===1||i===2||i===5||i===6){DropzoneIndex=0}
            if(i===3||i===4){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        await expect(frame.locator('.label-box').nth(6)).toHaveAttribute('aria-disabled', 'true');
        await expect(frame.locator('.label-box').nth(0)).toHaveAttribute('aria-disabled', 'false');


    });
    test('Grouping-The Feedback icon next to each label should be shown in Check my work mode.', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex = i;
            let DropzoneIndex = i;
            if (i === 0 || i === 2 || i === 3) { DropzoneIndex = 0 }
            if (i === 1 || i == 4) { DropzoneIndex = 1 }
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        const Notes = await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(1);
        await expect(Notes).toBeVisible();
    });
    test('Grouping-Label in the drop zone must be marked as the Correct if the label is placed under the correct group by the student.', async ({ page }) => {
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
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 4; i++) {
            const Dropzone = await frame.locator('span.feedback-text').nth(i);
            await expect(Dropzone).toHaveText('Correct')
        }


    });
    test('Grouping-Label in the drop zone must be marked as the Incorrect if the label is placed under the incorrect group by the student.', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex = i;
            let DropzoneIndex = i;
            if (i === 0 || i === 2 || i === 3) { DropzoneIndex = 0 }
            if (i === 1 || i == 4) { DropzoneIndex = 1 }
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 4; i++) {
            if (i === 2 || i === 3) {
                const Dropzone = await frame.locator('span.feedback-text').nth(i);
                await expect(Dropzone).toHaveText('Incorrect')
            } else {
                const Dropzone = await frame.locator('span.feedback-text').nth(i);
                await expect(Dropzone).toHaveText('Correct')
            }
        }
    });
    test('Grouping-Validating Feedback content and differnt format', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[8].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex = i;
            let DropzoneIndex = i;
            if (i === 0 || i === 2 || i === 3) { DropzoneIndex = 0 }
            if (i === 1 || i == 4) { DropzoneIndex = 1 }
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        for (let i = 0; i <= 4; i++) {
            if (i === 0) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click(); 
                await expect(frame.locator('div.popover-body > p')).toHaveAttribute('strong','')
                await expect(frame.locator('div.popover-body > p')).toHaveText('Odd')
            }
            if (i === 1) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p > p')).toHaveAttribute('em','')
                await expect(frame.locator('div.popover-body > p > p')).toHaveText('Even')
            }
            if (i === 2) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p > p > span')).toHaveAttribute('style', 'text-decoration: underline;')
                await expect(frame.locator('div.popover-body > p > p > span')).toHaveText('Odd')
            }
            if (i === 3) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p > p')).toHaveAttribute('sub','')
                await expect(frame.locator('div.popover-body > p > p')).toHaveText('ink')
            }
            if (i === 4) {
                await frame.locator('.dpg-icon.ngx-icon_20x20.dpg-icon-comment').nth(i).click();
                await expect(frame.locator('div.popover-body > p > p')).toHaveAttribute('sup','')
                await expect(frame.locator('div.popover-body > p > p')).toHaveText('RED')
            }


        }

    });
    test('Grouping-Each Label instance If any Label has more than one drop zone in Authoring mode, the count of the Label must be the same as the number of drop zones. ', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[9].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 5; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===2||i===5){DropzoneIndex=0}
            if(i===0||i===1||i===3||i===4){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        await expect(frame.locator('div.label-box.text>p > p').nth(0)).toContainText('One')
        await expect(frame.locator('div.label-box.text>p > p').nth(1)).toContainText('Two')
        await expect(frame.locator('div.label-box.text>p > p').nth(2)).toContainText('Two')
        await expect(frame.locator('div.label-box.text>p > p').nth(3)).toContainText('Three')
        await expect(frame.locator('div.label-box.text>p > p').nth(4)).toContainText('Four')
        await expect(frame.locator('div.label-box.text>p > p').nth(5)).toContainText('Four')

    });
    test('Grouping-Feedback policy set then display feedback icon', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[8].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 2; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await ezt_po.Feedback('');
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        await expect(frame.locator('i.dpg-icon-comment').nth(4)).not.toBeVisible();
        await ezt_po.Feedback('feedback');
        await ezt_po.LoadAPI();
        await expect(frame.locator('i.dpg-icon-comment').nth(4)).toBeVisible();
    });
    test('Grouping- verify image long description and short description', async ({ page }) => {
        let ezt_po = new EZT_PO(page);
        await ezt_po.InputState(records[11].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 2; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode = new TestMode_PO(page);
            await testmode.DragDrop(src, dst)
        }
        await ezt_po.RetrieveOutput();
        await ezt_po.CopyToInput();
        await page.locator('select[name="mode_select"]').selectOption('review');
        await ezt_po.LoadAPI();
        //alternative i need to check
        await expect(frame.locator('[alt="group 1 SD edited"]')).toBeVisible();
        await frame.locator('text=Image Description >> nth=0').click();
        await expect(frame.locator('p.modal-content-text')).toContainText('LD edited')
        await frame.locator('text= Close ').click();
    });
})