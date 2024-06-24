import { expect, FrameLocator, Locator, Page } from '@playwright/test'

export class CreateMode_PO {
    readonly page: Page
    readonly frame: FrameLocator
    readonly errorMsg: Locator
    readonly okayBtn: Locator
    readonly dropzoneText: Locator
    readonly warningMsg: Locator

    constructor(page: Page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[name="ext_012345678_1"]');
        this.warningMsg = this.frame.locator('.alert.alert-warning');
        this.okayBtn = this.frame.locator('button:has-text("OK")');
        this.dropzoneText = this.frame.locator('.dropzone-text');
        this.errorMsg=this.frame.locator('.alert.alert-error')


    }
    async WarningMessage(msg) {
        await expect(this.warningMsg).toContainText(msg);
        await this.okayBtn.click()

    }
    async ErrorMsg(msg) {
        await expect(this.errorMsg).toContainText(msg);
        await this.okayBtn.click()

    }
    async DropzoneText(dropText) {
        await expect(this.dropzoneText).toHaveText(dropText)
    }

}