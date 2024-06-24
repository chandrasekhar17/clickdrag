import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import{TestMode_PO} from "../PageObjectModel/TestMode_PO";
import { EZT_PO } from '../PageObjectModel/EZT_PO';
test.describe('Image Labeling', () => {
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        skip_empty_lines: true
    });
    test.beforeEach(async ({ page }) => {
        //await page.goto('testrig.html');
        let ezt_po= new EZT_PO(page);
        await ezt_po.visit();
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    })

    test('Image Labeling-one label to one dock 2 correct out of 4', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[0].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 3; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('50')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Image Labeling-one label to one dock 3 correct 1 distractor out of 4', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[1].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 3; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
            const src = await frame.locator('.label-box').nth(4);
            const dst = await frame.locator('.drop-zone.dropable').nth(1);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)  
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('75')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Image Labeling-one label to one dock 4 correct out of 4', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[1].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 3; i++) {
            const src = await frame.locator('.label-box').nth(i);
            const dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('100')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')

    });
    test('Image Labeling-Display Label Once 5 correct out of 5', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[2].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for(let i=0;i<=4;i++){
            let Labelindex=i;
            let DropzoneIndex=i;

            if(i === 1 || i === 2 || i === 3){ Labelindex=i-1}
            if(i === 4 ){ Labelindex=i-2}

            var src = await frame.locator('.label-box').nth(Labelindex);
            var dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst) 
        }
            
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('100')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')

    });
    test('Image Labeling-Display Label Once 4 correct 1 distractor out of 5', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[2].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for(let i=0;i<=4;i++){
            let Labelindex=i;
            let DropzoneIndex=i;

            if(i === 1 || i === 2 || i === 3 ||i===4){ Labelindex=i-1}

            var src = await frame.locator('.label-box').nth(Labelindex);
            var dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst) 
        }
            
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('80')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')

    });
    test('Image Labeling-Display Label Once 1 corrcet 3 incorrect 1 empty out of 5 20 score and completion 80', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[2].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for(let i=0;i<=3;i++){
            var src = await frame.locator('.label-box').nth(i);
            var dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('20')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('80')

    });
    test('Image Labeling-Display Each Label Instance 5 correct out of 5', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[3].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for(let i=0;i<=4;i++){
            var src = await frame.locator('.label-box').nth(i);
            var dst = await frame.locator('.drop-zone.dropable').nth(i);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('100')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')

    });
    test('Image Labeling-Display Each Label Instance 2 correct 2 incorrect 1 empty->score 40 and completion 80 ', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[3].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for(let i=0;i<=3;i++){
            var src = await frame.locator('.label-box').nth(i);
            var dst = await frame.locator('.drop-zone.dropable').nth(i+1);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('40')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('80')

    });
});
test.describe('Grouping score', () => {
    const records = parse(fs.readFileSync(path.join(__dirname, 'testmode.csv')), {
        columns: true,
        skip_empty_lines: true
    });
    test.beforeEach(async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.visit();
    });
    test.afterEach(async ({ page }) => {
        await page.close();
    })

    test('Grouping-one label to one dock 5 correct out of 5', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2){DropzoneIndex=0}
            if(i===3||i===4){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('100')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-one label to one dock 3 correct out of 5 -Score 60', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex= i;
            let DropzoneIndex=i;
            if(i===0||i===2||i===3){DropzoneIndex=0}
            if(i===1||i==4){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('60')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-one label to one dock 5 Incorrect out 0f 5-> score 0 and 100 completion', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2){DropzoneIndex=1}
            if(i===3||i===4){DropzoneIndex=0}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('0')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-one label to one dock for distractor will not deduct the score', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[4].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 6; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2||i===5||i===6){DropzoneIndex=0}
            if(i===3||i===4){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('100')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-Display Label Once 100 score and 100 completion', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[5].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2){DropzoneIndex=0}
            if(i===3||i===4){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('100')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-Display Label Once correct answer less than wrong answer', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[5].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex= i;
            let DropzoneIndex=i;
            if(i===0||i===2||i===3){DropzoneIndex=0}
            if(i===1||i==4){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('20')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-Display Label Once correct answer= wrong answer', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[5].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 4; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2){DropzoneIndex=0}
            if(i===3||i===4){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        } 
        for (let i = 0; i <= 4; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2){DropzoneIndex=1}
            if(i===3||i===4){DropzoneIndex=0}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('0')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-Display Label Once correct answer> wrong answer ', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[5].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 6; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2){DropzoneIndex=0}
            if(i===3||i===4||i===5||i===6){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('60')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-Each Label instance 6 correct out of 6-> score 100 and 100 completion', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[6].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 5; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2||i===3){DropzoneIndex=0}
            if(i===4||i===5){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('100')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-Each Label instance 4 correct out of 6', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[6].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 5; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===5||i===2||i===3){DropzoneIndex=0}
            if(i===4||i===1){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('66.67')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    test('Grouping-Each Label instance 6 correct 2 Distractor out of 6->score 100 and 100 completion', async ({ page }) => {
        let ezt_po= new EZT_PO(page);
        await ezt_po.InputState(records[6].states);
        await page.locator('select[name="mode_select"]').selectOption('test');
        await ezt_po.LoadAPI();
        const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        for (let i = 0; i <= 7; i++) {
            let LabelIndex=i;
            let DropzoneIndex=i;
            if(i===0||i===1||i===2||i===3||i===6){DropzoneIndex=0}
            if(i===4||i===5||i===7){DropzoneIndex=1}
            const src = await frame.locator('.label-box').nth(LabelIndex);
            const dst = await frame.locator('.drop-zone.dropable').nth(DropzoneIndex);
            let testmode= new TestMode_PO(page);
            await testmode.DragDrop(src,dst)   
        }
        await ezt_po.RetrieveOutput();
        const score=await page.locator('input[name="ext_012345678_1_eval"]');
        await expect(score).toHaveValue('100')
        const completion= await page.locator('input[name="ext_012345678_1_completion"]');
        await expect(completion).toHaveValue('100')


    });
    

});
