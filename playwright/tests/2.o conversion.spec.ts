import * as fs from 'fs';
import * as path from 'path';
import { expect, test } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import * as data from '../Data/Conversion.json';
import { EZT_PO } from "../PageObjectModel/EZT_PO"
import { Activity_PO } from "../PageObjectModel/Activity_PO"
import { CreateMode_PO } from "../PageObjectModel/CreateMode_PO"
test.describe('Image Labeling-As an Author I have Image labling type of content in tool version 2.0, which needs to be rendered in 3.0 so that I can work on top of my existing content ', () => {
  let frame: any = null;
  const records = parse(fs.readFileSync(path.join(__dirname, 'Questions.csv')), {
    columns: true,
    relax_quotes: true,
    skip_empty_lines: true
  });
  test.beforeEach(async ({ page }) => {
    //await page.goto('testrig.html');
    const ezt_po = new EZT_PO(page);
    await ezt_po.visit()
    //visit

  });
  test.afterEach(async ({ page }) => {
    await page.close();
  })

  test('Image Labeling-If the 2.0 question has any text created using Type tool', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[0].states)
    await ezt_po.ItemMedia(records[0].Media)
    await ezt_po.LoadAPI()
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    await createmode_po.WarningMessage(records[0].ErrorMessage);
    await page.screenshot({ path: 'screenshot/Imgtypetool.jpg', fullPage: true });
    const dropzoneText = await frame.locator('.dropzone-text');
    await expect(dropzoneText).toContainText(data.DropzoneTextTypetool)
    await expect(frame.locator('.background-image')).toHaveAttribute('xlink:href', records[0].URL)
  });


  test('Image Labeling- If the Activity type is Text completion/Ordering or Click to select', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[1].states)
    await ezt_po.LoadAPI();
    await createmode_po.ErrorMsg(records[1].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const activityTitle = await frame.locator('h2.modal-title');
    await expect(activityTitle).toContainText(' Activity ');
  })
  test('ImageLabeling-If 2.0 question has 18 labels and 10 distractors, 18 labels and 2 distractors must be retained', async ({ page }) => {
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[19].states+records[20].states)
    await ezt_po.LoadAPI();
    await createmode_po.WarningMessage(records[19].ErrorMessage)
    const Nodistractor = frame.locator('div.distractor-border');
    const TotalLabel = frame.locator('app-single-label.label-move-cursor')
    await expect(Nodistractor).toHaveCount(2)
    await expect(TotalLabel).toHaveCount(20)
    await expect(frame.locator('[fill="transparent"]')).toHaveCount(18)
  })
  test('ImageLabeling-If 2.0 question has 30 labels and 10 distractors, top 20 labels must be retained', async ({ page }) => {
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[21].states+records[22].states+records[23].states)
    await ezt_po.LoadAPI();
    await createmode_po.WarningMessage(records[21].ErrorMessage)
    const Nodistractor = frame.locator('div.distractor-border');
    const TotalLabel = frame.locator('app-single-label.label-move-cursor')
    await expect(Nodistractor).not.toBeVisible();
    await expect(TotalLabel).toHaveCount(20)
    await expect(frame.locator('[fill="transparent"]')).toHaveCount(20)
  })
  test('Image Labeling-When the activity contains more than one Background image', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[2].states)
    await ezt_po.MediaState(records[2].Media)
    await ezt_po.LoadAPI()
    await createmode_po.WarningMessage(records[2].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const activityTitle = await frame.locator('.activity-title.ng-star-inserted');
    await expect(activityTitle).toContainText('Image Labeling - Same label to multiple docks');
    await page.screenshot({ path: 'screenshot/ImgOneImage.jpg', fullPage: true });

  })
  test('Image Labeling-Display Each Label Instance', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[8].states)
    await ezt_po.LoadAPI()
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const dropzone = await frame.locator('div.dropzone-text')
    await expect(dropzone).toHaveCount(5)
    await page.screenshot({ path: 'screenshot/ImgEachlabelinstance.jpg', fullPage: true });
    await expect(frame.locator('.dropzone-text')).toContainText(data.ImgEachLabelInstance)
  })
  test('Image Labeling-Display Label Once', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[9].states)
    await ezt_po.LoadAPI()
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const dropzone = await frame.locator('div.dropzone-text')
    await expect(dropzone).toHaveCount(5)
    await page.screenshot({ path: 'screenshot/ImagDisplayLabelOnce.jpg', fullPage: true });
    await expect(frame.locator('.dropzone-text')).toContainText(data.ImgDisplayLabelOnce)
  })
  test('Image Labeling-If the 2.0 question has Audio Label without Label text', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[12].states)
    await ezt_po.MediaState(records[12].Media)
    await ezt_po.LoadAPI()
    await createmode_po.WarningMessage(records[12].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    await page.screenshot({ path: 'screenshot/ImgAudio.jpg', fullPage: true });
    const NoofLabel = await frame.locator('.label-text-box.draggable.ng-star-inserted');
    await expect(NoofLabel).toHaveCount(2)
    const NoofDropzone = await frame.locator('.dropzone-text');
    await expect(NoofDropzone).toHaveCount(2)
  });
  test('Image Labeling-If the 2.0 question has Audio Label with Label text', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[13].states)
    await ezt_po.MediaState(records[13].Media)
    await ezt_po.LoadAPI()
    await createmode_po.WarningMessage(records[13].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    await page.screenshot({ path: 'screenshot/ImgAudiowithlabel.jpg', fullPage: true });
    const NoofDropzone = await frame.locator('.dropzone-text');
    await expect(NoofDropzone).toHaveCount(5)
    await expect(frame.locator('.dropzone-text')).toContainText(['1', '2', '3', '4', '5'])

  });
  test('Image Labeling-If the 3.0 question has Audio Label', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[14].states)
    await page.locator('select[name="mode_select"]').selectOption('test');
    await ezt_po.LoadAPI()
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    await expect(frame.locator('.errorMessage').nth(0)).toContainText(records[14].ErrorMessage)
    await expect(frame.locator('mhe-alert > div > p:nth-child(2) > a')).toHaveAttribute('href', data.ConnectURL)
    await page.screenshot({ path: 'screenshot/ImgAudiowithlabeltest.jpg', fullPage: true });
  });
  test('Image Labeling-If at least one labels drop zone description is empty)', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[0].states)
    await ezt_po.ItemMedia(records[0].Media)
    await ezt_po.LoadAPI()
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    await createmode_po.WarningMessage(records[0].ErrorMessage);
    const ele = page.$('button:has-text("Retrieve Output")')
    page.on("dialog", (dialog) => {
      console.log(dialog.message());
      expect(dialog.message()).toContain(data.MsgDropDescEmpty)
      dialog.accept()
    })
    await (await ele).click()
  });
  test('Image Labeling-If at least one label is empty (No image or text) and at least one labels drop zone description is empty)', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    const activity_po = new Activity_PO(page);
    await ezt_po.LoadAPI()
    await activity_po.ImageOneLabelToOneDock();
    const ele = page.$('button:has-text("Retrieve Output")')
    page.on("dialog", (dialog) => {
      console.log("Msg", dialog.message());
      let formatMsg = dialog.message().replace('\n', "")
      expect(formatMsg).toBe(data.MsgLabelDropDescEmpty)
      dialog.accept();
    })
    await (await ele).click()
  });

});
test.describe('Grouping-As an Author I have Image labling type of content in tool version 2.0, which needs to be rendered in 3.0 so that I can work on top of my existing content ', () => {
  const records = parse(fs.readFileSync(path.join(__dirname, 'Questions.csv')), {
    columns: true,
    skip_empty_lines: true
  });
  test.beforeEach(async ({ page }) => {
    //await page.goto('testrig.html');
    const ezt_po = new EZT_PO(page);
    await ezt_po.visit()
  });
  test('Grouping-If the 2.0 question has any text created using Type tool', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[3].states)
    await ezt_po.ItemMedia(records[3].Media)
    await ezt_po.LoadAPI()
    await createmode_po.WarningMessage(records[3].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const title = await frame.locator('.activity-title.ng-star-inserted');
    await expect(title).toContainText("Grouping - One label to one dock")
    const group1Text = await frame.locator('#dropzone_1');
    await expect(group1Text).toContainText(data.GroupingTypeTool1)
    const group2Text = await frame.locator('#dropzone_2');
    await expect(group2Text).toContainText(data.GroupingTypeTool2)
    await expect(frame.locator('img.media-image').nth(0)).toHaveAttribute('src', data.ImageLink1)
    await expect(frame.locator('img.media-image').nth(1)).toHaveAttribute('src', data.ImageLink2)
    await page.screenshot({ path: 'screenshot/Grptypetool.jpg', fullPage: true });
  });
  test('Grouping-If the number of group images used are less than the number of groups created', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[4].states)
    await ezt_po.ItemMedia(records[4].Media)
    await ezt_po.LoadAPI()
    await createmode_po.WarningMessage(records[4].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const activityTitle = await frame.locator('.activity-title.ng-star-inserted');
    await expect(activityTitle).toContainText('Grouping - One label to one dock');
    await page.screenshot({ path: 'screenshot/Grpmoreimg.jpg', fullPage: true });
    const group1Text = await frame.locator('#dropzone_1');
    await expect(group1Text).toContainText(data.GroupLessImage1)
    const group2Text = await frame.locator('#dropzone_2');
    await expect(group2Text).toContainText(data.GroupLessImage2)
    const group3Text = await frame.locator('#dropzone_3');
    await expect(group3Text).toContainText(data.GroupLessImage3)
    const group4Text = await frame.locator('#dropzone_4');
    await expect(group4Text).toContainText(data.GroupLessImage4)
    const addImageBtn = frame.locator('text=Add Image');
    expect(addImageBtn).toHaveCount(4)
    await frame.locator('text=Add Image').first().click();
    await frame.locator('div[role="dialog"] button:has-text("Add")').click();
    await expect(frame.locator('Img.media-image')).toBeVisible();

  })
  test('Grouping-If the 2.0 question has more than 6 groups', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[5].states)
    await ezt_po.ItemMedia(records[5].Media)
    await ezt_po.LoadAPI()
    await createmode_po.WarningMessage(records[5].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const dropzone = await frame.locator('div.single-drop-zone');
    await expect(dropzone).toHaveCount(6)
    await page.screenshot({ path: 'screenshot/Grpmore6grp.jpg', fullPage: true });
  })
  test('Grouping-Display Each Label Instance', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[6].states)
    await ezt_po.ItemMedia(records[6].Media)
    await ezt_po.LoadAPI()
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const dropzonetext = await frame.locator('text=Whiteβ')
    await expect(dropzonetext).toHaveCount(7)
    const group = await frame.locator('div.single-drop-zone');
    await expect(group).toHaveCount(6)
    await page.screenshot({ path: 'screenshot/GrpEachlabel.jpg', fullPage: true });
    await expect(frame.locator('div.single-drop-zone').nth(0)).toContainText(data.GrpEachLabelInstance1)
    await expect(frame.locator('div.single-drop-zone').nth(1)).toContainText(data.GrpEachLabelInstance2)
    await expect(frame.locator('div.single-drop-zone').nth(2)).toContainText(data.GrpEachLabelInstance3)
    await expect(frame.locator('div.single-drop-zone').nth(3)).toContainText(data.GrpEachLabelInstance4)
  })
  test('Grouping-Display Label Once', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[7].states)
    await ezt_po.ItemMedia(records[7].Media)
    await ezt_po.LoadAPI()
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const dropzonetext = await frame.locator('text=Label2')
    await expect(dropzonetext).toHaveCount(3)
    const group = await frame.locator('div.single-drop-zone');
    await expect(group).toHaveCount(2)
    await page.screenshot({ path: 'screenshot/Grpdisplaylabel.jpg', fullPage: true });
    await expect(frame.locator('div.single-drop-zone').nth(0)).toContainText(data.GrpDisplayLabelOnce1)
    await expect(frame.locator('div.single-drop-zone').nth(1)).toContainText(data.GrpDisplayLabelOnce2)
  })
  test('Grouping-If the 2.0 question has Audio Label without Label text', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[10].states)
    await ezt_po.MediaState(records[10].Media)
    await ezt_po.LoadAPI()
    await createmode_po.WarningMessage(records[10].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const title = await frame.locator('.activity-title.ng-star-inserted');
    await expect(title).toContainText("Grouping - One label to one dock")
    await page.screenshot({ path: 'screenshot/GrpAudio.jpg', fullPage: true });
    const NoofLabel = await frame.locator('app-single-label');
    await expect(NoofLabel).toHaveCount(2)
    const NoofDropzone = await frame.locator('div.single-drop-zone');
    await expect(NoofDropzone).toHaveCount(2)
  });
  test('Grouping-If the 2.0 question has Audio Label with Label text', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[11].states)
    await ezt_po.MediaState(records[11].Media)
    await ezt_po.LoadAPI()
    await createmode_po.WarningMessage(records[11].ErrorMessage)
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const title = await frame.locator('.activity-title.ng-star-inserted');
    await expect(title).toContainText("Grouping - One label to one dock")
    await page.screenshot({ path: 'screenshot/GrpAudiowithlabel.jpg', fullPage: true });
    const NoofDropzone = await frame.locator('div.single-drop-zone');
    await expect(NoofDropzone).toHaveCount(2)
    await expect(frame.locator('div.single-drop-zone').nth(0)).toContainText(data.GrpAudWithText1)
    await expect(frame.locator('div.single-drop-zone').nth(1)).toContainText(data.GrpAudWithText2)

  });
  test('Grouping-If 2.0 question has 18 labels and 10 distractors, 18 labels and 2 distractors must be retained', async ({ page }) => {
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[16].states)
    await ezt_po.LoadAPI();
    await createmode_po.WarningMessage(records[16].ErrorMessage)
    const Nodistractor = frame.locator('div.distractor-border');
    const TotalLabel = frame.locator('app-single-label.label-move-cursor')
    await expect(Nodistractor).toHaveCount(2)
    await expect(TotalLabel).toHaveCount(20)
    await expect(frame.locator('div.droppedLabel-boder')).toHaveCount(18)
  })
  test('Grouping-If 2.0 question has 30 labels and 10 distractors, top 20 labels must be retained', async ({ page }) => {
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[17].states+records[18].states)
    await ezt_po.LoadAPI();
    await createmode_po.WarningMessage(records[17].ErrorMessage)
    const Nodistractor = frame.locator('div.distractor-border');
    const TotalLabel = frame.locator('app-single-label.label-move-cursor')
    await expect(Nodistractor).not.toBeVisible();
    await expect(TotalLabel).toHaveCount(20)
    await expect(frame.locator('div.droppedLabel-boder')).toHaveCount(20)
  })
  test('Grouping-If the 3.0 question has Audio Label', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    await ezt_po.InputState(records[15].states)
    await page.locator('select[name="mode_select"]').selectOption('test');
    await ezt_po.LoadAPI()
    const frame = await page.frameLocator('iframe[name="ext_012345678_1"]');
    await expect(frame.locator('.errorMessage').nth(0)).toContainText(records[15].ErrorMessage)
    await expect(frame.locator('mhe-alert > div > p:nth-child(2) > a')).toHaveAttribute('href', data.ConnectURL)
    await page.screenshot({ path: 'screenshot/ImgAudiowithlabeltest.jpg', fullPage: true });


  });
  test('Grouping-If at least one label is empty (No image or text)', async ({ page }) => {
    const ezt_po = new EZT_PO(page);
    const createmode_po = new CreateMode_PO(page);
    const activity_po = new Activity_PO(page);
    await ezt_po.LoadAPI()
    await activity_po.GroupingOneLabelOneDock();
    const ele = page.$('button:has-text("Retrieve Output")')
    page.on("dialog", (dialog) => {
      console.log(dialog.message());
      expect(dialog.message()).toContain(data.MsgLabelEmpty)
      dialog.accept();
    })
    await (await ele).click()
  });
});


