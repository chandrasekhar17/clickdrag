import { test, expect } from '@playwright/test';
import * as data from '../Data/ImageDescription.json'
import { EZT_PO } from "../PageObjectModel/EZT_PO"
import{Activity_PO} from "../PageObjectModel/Activity_PO"
test.describe('After adding background image for Image labeling activity, author should be able to update the description of it  from right panel "Image Description" Accordion', () => {
    let frame:any =null;
    test.beforeEach(async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
        await ezt_po.LoadAPI()
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
        const activity= new Activity_PO(page);
        await activity.ImageOneLabelToOneDock();
    });
    test('Image description accordion should not be available when there is no background image added to the activity', async ({ page }) => {
        const imageDescAccor = await frame.locator('text=accordion-closeImage Description >> button')
        await expect(imageDescAccor).not.toBeVisible();
    });
    test('When background image is added, author should be able to see "Image Description" Accordion', async ({ page }) => {
        // Click text=Add Image
        await frame.locator('text=Add Image').click();
        // Click button:has-text("Add")
        await frame.locator('button:has-text("Add")').click();
        const imageDescAccor = await frame.locator('text=accordion-closeImage Description >> button')
        await expect(imageDescAccor).toBeVisible();
    });
    test('In Edit author should be able to update the default description @smoke', async ({ page }) => {
        await frame.locator('text=Add Image').click();
        await frame.locator('button:has-text("Add")').click();
        await frame.locator('text=accordion-closeImage Description >> button').click();
        await frame.locator('text=Edit').click();
        // Edit Short Description
        await frame.locator('textarea.form-control').nth(0).press('Control+a')
        await frame.locator('textarea.form-control').nth(0).fill(data.EditedShortImgDesc);
        // Edit Long Description
        await frame.locator('textarea.form-control').nth(1).click();
        await frame.locator('textarea.form-control').nth(1).press('Control+a');
        await frame.locator('textarea.form-control').nth(1).fill(data.EditedLongImgDesc);
        await frame.locator('text=Save').click();
        //Validating Long and short description after editing
        const shortDesc = await frame.locator('p.ng-star-inserted').nth(0);
        await expect(shortDesc).toHaveText(data.EditedShortImgDesc);
        const longDesc = await frame.locator('p.ng-star-inserted').nth(1);
        await expect(longDesc).toHaveText(data.EditedLongImgDesc);
        //Validation Long description when user click on image description link below the image
        await frame.locator('text=Image Description').first().click();
        const ActuallongDesc = await frame.locator('.modal-content-text');
        await expect(ActuallongDesc).toHaveText(data.EditedLongImgDesc)

    });
    test('Author should be able to reset the description to the default description by clicking on "Reset Description" button.', async ({ page }) => {
        await frame.locator('text=Add Image').click();
        await frame.locator('button:has-text("Add")').click();
        await frame.locator('text=accordion-closeImage Description >> button').click();
        await frame.locator('text=Edit').click();
        // Editing Short Description
        await frame.locator('textarea.form-control').nth(0).press('Control+a')
        await frame.locator('textarea.form-control').nth(0).fill(data.EditedShortImgDesc);
        // Editing Long Description
        await frame.locator('textarea.form-control').nth(1).click();
        await frame.locator('textarea.form-control').nth(1).press('Control+a');
        await frame.locator('textarea.form-control').nth(1).fill(data.EditedLongImgDesc);
        await frame.locator('text=Save').click();
        //validating long and short decription
        var shortDesc = await frame.locator('p.ng-star-inserted').nth(0);
        await expect(shortDesc).toContainText(data.EditedShortImgDesc);
        var longDesc = await frame.locator('p.ng-star-inserted').nth(1);
        await expect(longDesc).toContainText(data.EditedLongImgDesc);
        await frame.locator('text=Edit').click();
        // Click on Reset Description
        await frame.locator('text=Reset Description').first().click();
        await frame.locator('text=Long Description16/1000 Long DescriptionReset Description >> button').click();
        await frame.locator('text=Save').click();
        //Validating short and long description after reset description
        var shortDesc = await frame.locator('p.ng-star-inserted').nth(0);
        await expect(shortDesc).toContainText(data.ShortDescription);
        var longDesc = await frame.locator('p.ng-star-inserted').nth(1);
        await expect(longDesc).toContainText(data.LongDescription);
        //validating long description when user click on image description link
        await frame.locator('text=Image Description').first().click();
        var ActuallongDesc = await frame.locator('.modal-content-text');
        await expect(ActuallongDesc).toContainText(data.LongDescription);

    });
    test('In Edit mode, author should be able to cancel the changes by clicking on "Cancel" button.', async ({ page }) => {
        await frame.locator('text=Add Image').click();
        await frame.locator('button:has-text("Add")').click();
        await frame.locator('text=accordion-closeImage Description >> button').click();
        await frame.locator('text=Edit').click();
        //Editing short description
        await frame.locator('textarea.form-control').nth(0).press('Control+a')
        await frame.locator('textarea.form-control').nth(0).fill(data.EditedShortImgDesc);
        // Editing long description
        await frame.locator('textarea.form-control').nth(1).click();
        await frame.locator('textarea.form-control').nth(1).press('Control+a');
        await frame.locator('textarea.form-control').nth(1).fill(data.EditedLongImgDesc);
        await frame.locator('text=Cancel').click();
        //validating short and long description whenuser click on cancel
        var shortDesc = await frame.locator('p.ng-star-inserted').nth(0);
        await expect(shortDesc).toHaveText(data.ShortDescription);
        var longDesc = await frame.locator('p.ng-star-inserted').nth(1);
        await expect(longDesc).toContainText(data.LongDescription);
        //validating long description when user click on image description link
        await frame.locator('text=Image Description').first().click();
        var ActuallongDesc = await frame.locator('.modal-content-text');
        await expect(ActuallongDesc).toContainText(data.LongDescription);
    });
});
test.describe('Grouping-As an author I should be able to see description added to the images of Lebels and edit it if required', () => {
    let frame: any = null;
    test.beforeEach(async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
        await ezt_po.LoadAPI()
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    });
    test('Image description accordion should not be available when there is no image added to the Label', async ({ page }) => {

        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await frame.locator('text=Edit').click();
        const imageDescAccor = await frame.locator('div[role="dialog"] button:has-text("accordion-close")')
        await expect(imageDescAccor).not.toBeVisible();
    });
    test('When background image is added, author should be able to see "Image Description" Accordion', async ({ page }) => {
        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await frame.locator('text=Edit').click();
        await frame.locator('div[role="dialog"] >> text=Add Image').click();
        await frame.locator('text=Select').click();
        const imageDescAccor = await frame.locator('div[role="dialog"] button:has-text("accordion-close")')
        await expect(imageDescAccor).toBeVisible();
    });
    test('In Edit author should be able to update the default description @smoke', async ({ page }) => {
        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await frame.locator('text=Edit').click();
        await frame.locator('div[role="dialog"] >> text=Add Image').click();
        await frame.locator('text=Select').click();
        await frame.locator('div[role="dialog"] button:has-text("accordion-close")').click();
        await frame.locator('textarea.form-control').press('Control+a')
        await frame.locator('textarea.form-control').fill(data.EditedShortImgDesc);
        await frame.locator('text=Save Label').click();
        //Validating Long and short description after editing
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await frame.locator('text=Edit').click();
        await frame.locator('div[role="dialog"] button:has-text("accordion-close")').click();
        var shortDesc = await frame.locator('textarea.form-control');
        await expect(shortDesc).toHaveText(data.EditedShortImgDesc);
        
    });
    test('Author should be able to reset the description to the default description by clicking on "Reset Description" button.', async ({ page }) => {

        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await frame.locator('text=Edit').click();
        await frame.locator('div[role="dialog"] >> text=Add Image').click();
        await frame.locator('text=Select').click();
        await frame.locator('div[role="dialog"] button:has-text("accordion-close")').click();
        await frame.locator('textarea.form-control').press('Control+a')
        await frame.locator('textarea.form-control').fill(data.EditedShortImgDesc);
        await frame.locator('text=Save Label').click();
        //Validating Long and short description after editing
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await frame.locator('text=Edit').click();
        await frame.locator('div[role="dialog"] button:has-text("accordion-close")').click();
        var shortDesc = await frame.locator('textarea.form-control');
        await expect(shortDesc).toHaveText(data.EditedShortImgDesc);
        // Click on Reset Description
        await frame.locator('text=Reset Description').click();
        //Validating short description after reset description
        var shortDesc = await frame.locator('textarea.form-control');
        await expect(shortDesc).toContainText(data.ShortDescription);

    });
    test('In Edit mode, author should be able to cancel the changes by clicking on "Cancel" button.', async ({ page }) => {

        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('.ahe-icon-system-kebab').first().click();
        await frame.locator('text=Edit').click();
        await frame.locator('div[role="dialog"] >> text=Add Image').click();
        await frame.locator('text=Select').click();
        await frame.locator('div[role="dialog"] button:has-text("accordion-close")').click();
        await frame.locator('textarea.form-control').press('Control+a')
        await frame.locator('textarea.form-control').fill(data.EditedShortImgDesc);
        await frame.locator('text=Cancel').click();
        await expect(frame.locator('div.label-media')).not.toBeVisible();
    });
});
test.describe('Grouping-As an author I should be able to see description added to the groups and edit it if required', () => {
    let frame: any = null;
    test.beforeEach(async ({ page }) => {
        const ezt_po = new EZT_PO(page);
        await ezt_po.visit()
        await ezt_po.LoadAPI()
        frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    });
    test('Image description accordion should not be available when there is no image added to the groups', async ({ page }) => {
        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        const imageDescAccor = await frame.locator('text=accordion-closeImage Description >> button')
        await expect(imageDescAccor).not.toBeVisible();
    });
    test('When image is added to group, author should be able to see "Image Description" Accordion', async ({ page }) => {
        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Image').first().click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        const imageDescAccor = await frame.locator('text=accordion-closeImage Description >> button')
        await expect(imageDescAccor).toBeVisible();
    });
    test('In Edit author should be able to update the default description for the group', async ({ page }) => {
        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Image').first().click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        await frame.locator('text=accordion-closeImage Description >> button').click();
        await frame.locator('text=Edit').click();
        await frame.locator('textarea.form-control').nth(0).press('Control+a')
        await frame.locator('textarea.form-control').nth(0).fill(data.EditedShortImgDesc);
        await frame.locator('textarea.form-control').nth(1).press('Control+a')
        await frame.locator('textarea.form-control').nth(1).fill(data.EditedLongImgDesc);
        await frame.locator('text=Save').click();
        await frame.locator('a[role="application"]:has-text("Image Description")').click();
        const ActuallongDesc = await frame.locator('.modal-content-text');
        await expect(ActuallongDesc).toHaveText(data.EditedLongImgDesc)
        await frame.locator('div[role="dialog"] >> text=Close').click();
        await expect(frame.locator('p.ng-star-inserted').nth(0)).toHaveText(data.EditedShortImgDesc)
        await expect(frame.locator('p.ng-star-inserted').nth(1)).toHaveText(data.EditedLongImgDesc)
    });
    test('Author should be able to reset the description to the default description by clicking on "Reset Description" button for the group image', async ({ page }) => {

        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Image').first().click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        await frame.locator('text=accordion-closeImage Description >> button').click();
        await frame.locator('text=Edit').click();
        await frame.locator('textarea.form-control').nth(0).press('Control+a')
        await frame.locator('textarea.form-control').nth(0).fill(data.EditedShortImgDesc);
        await frame.locator('textarea.form-control').nth(1).press('Control+a')
        await frame.locator('textarea.form-control').nth(1).fill(data.EditedLongImgDesc);
        await frame.locator('text=Save').click();
        // Click on Reset Description
        await frame.locator('text=Edit').click();
        await frame.locator('text=Reset Description').first().click();
        await frame.locator('text=Reset Description').nth(1).click();
        await frame.locator('text=Save').click();
        //Validating description after reset description
        await expect(frame.locator('p.ng-star-inserted').nth(0)).toHaveText(data.ShortDescription)
        await expect(frame.locator('p.ng-star-inserted').nth(1)).toHaveText(data.LongDescription)

    });
    test('In Edit mode, author should be able to cancel the changes by clicking on "Cancel" button for group image', async ({ page }) => {

        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Image').first().click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        await frame.locator('text=accordion-closeImage Description >> button').click();
        await frame.locator('text=Edit').click();
        await frame.locator('textarea.form-control').nth(0).press('Control+a')
        await frame.locator('textarea.form-control').nth(0).fill(data.EditedShortImgDesc);
        await frame.locator('textarea.form-control').nth(1).press('Control+a')
        await frame.locator('textarea.form-control').nth(1).fill(data.EditedLongImgDesc);
        await frame.locator('text=Cancel').click();
        await expect(frame.locator('p.ng-star-inserted').nth(0)).toHaveText(data.ShortDescription)
        await expect(frame.locator('p.ng-star-inserted').nth(1)).toHaveText(data.LongDescription)
    });
    test('Edit button should be disabled for other group image description', async ({ page }) => {
        const activity= new Activity_PO(page);
        await activity.GroupingOneLabelOneDock();
        await frame.locator('text=Add Image').first().click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        await frame.locator('text=Add Image').first().click();
        await frame.locator('span.media_name').nth(1).click();
        await frame.locator('div[role="dialog"] button:has-text("Add")').click();
        await frame.locator('text=accordion-closeImage Description >> button').click();
        await frame.locator('text=Edit').nth(0).click();
        const EditBtn=await frame.locator('text=Edit').nth(0);
        await expect(EditBtn).not.toBeEnabled();
    });
});