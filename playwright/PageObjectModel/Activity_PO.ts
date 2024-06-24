import { expect, FrameLocator, Locator, Page } from '@playwright/test'

export class Activity_PO {
    //Define selector
    readonly page: Page
    readonly grouping: Locator
    readonly frame: FrameLocator
    readonly displayLabelOnce: Locator
    readonly displayEachLabelInstance: Locator
    readonly startButton: Locator
    readonly Grouping: Locator

    constructor(page: Page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[name="ext_012345678_1"]');
        this.displayLabelOnce = this.frame.locator('text=Same label to multiple docks');
        this.displayEachLabelInstance = this.frame.locator('text=Display each label instance');
        this.startButton = this.frame.locator('text=Start');
        this.Grouping = this.frame.locator('text=Grouping');
    }
    async ImageOneLabelToOneDock() {
        await this.startButton.click();
        const ActivityTitle = this.frame.locator('h1');
        await expect(ActivityTitle).toContainText('Image Labeling - One label to one dock')
    }
    async ImageDisplayLabelOnce() {
        await this.displayLabelOnce.click();
        await this.startButton.click();
        const ActivityTitle = this.frame.locator('h1');
        await expect(ActivityTitle).toContainText('Image Labeling - Same label to multiple docks')

    }
    async ImageDisplayEachLabelInstance() {
        await this.displayLabelOnce.click();
        await this.displayEachLabelInstance.click();
        await this.startButton.click();
        const ActivityTitle = this.frame.locator('h1');
        await expect(ActivityTitle).toContainText('Image Labeling - Same label to multiple docks')
    }
    async GroupingOneLabelOneDock() {
        await this.Grouping.click();
        await this.startButton.click();
        const ActivityTitle = this.frame.locator('h1');
        await expect(ActivityTitle).toContainText('Grouping - One label to one dock')

    }
    async GroupingDisplayLabelOnce() {
        await this.Grouping.click();
        await this.displayLabelOnce.click();
        await this.startButton.click();
        const ActivityTitle = this.frame.locator('h1');
        await expect(ActivityTitle).toContainText('Grouping - Same label to multiple docks')
    }
    async GroupingEachLabelInstance() {
        await this.Grouping.click();
        await this.displayLabelOnce.click();
        await this.displayEachLabelInstance.click()
        await this.startButton.click();
        const ActivityTitle = this.frame.locator('h1');
        await expect(ActivityTitle).toContainText('Grouping - Same label to multiple docks')
    }

}
