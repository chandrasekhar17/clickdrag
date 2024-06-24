import { expect, FrameLocator, Locator, Page } from '@playwright/test'

export class TestMode_PO {
    readonly page: Page
    readonly frame: FrameLocator
    constructor(page: Page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[name="ext_012345678_1"]');
    }
    async DragDrop(src,dst){
        const srcBound = await src.boundingBox()
        const dstBound = await dst.boundingBox()
        await this.page.mouse.move(srcBound.x + srcBound.width / 2, srcBound.y + srcBound.height / 2)
        await this.page.mouse.down();
        await this.page.mouse.move(dstBound.x + dstBound.width / 2, dstBound.y + dstBound.height / 2)
        await this.page.mouse.up();
    }

}
