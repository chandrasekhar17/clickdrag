import test, { expect, Locator, Page } from '@playwright/test'
import { timeout } from 'rxjs/operators'

export class EZT_PO {
    //Define selector
    readonly page: Page
    readonly inputState: Locator
    readonly loadAPI: Locator
    readonly retrieveOutput: Locator
    readonly copyToInput: Locator
    readonly mediaInput: Locator
    readonly itemMedia: Locator
    readonly feedback: Locator


    //init selector using constructor
    constructor(page: Page) {
        this.page = page;
        this.inputState = page.locator('textarea[name="ext_012345678_1_state"]')
        this.copyToInput = page.locator('text=<- copy ^ to input')
        this.loadAPI = page.locator('button:has-text("Load API Below")')
        this.mediaInput = page.locator('#ext_012345678_media')
        this.retrieveOutput = page.locator('button:has-text("Retrieve Output")')
        this.itemMedia = page.locator('#ext_012345678_itemmedia')
        this.feedback = page.locator('[value="feedback"]')
    }
    async visit() {
        
        await this.page.goto('testrig.html')
        
    }

    async InputState(input: string) {
        await this.inputState.fill(input)
    }
    async MediaState(media: string) {
        await this.mediaInput.fill(media)
    }
    async LoadAPI() {
        await this.loadAPI.click({timeout:50000})
        await this.page.mouse.wheel(0, 300);
    }
    async RetrieveOutput() {
        await this.retrieveOutput.click()
    }
    async CopyToInput() {
        await this.copyToInput.click({timeout:5000})
    }
    async ItemMedia(Media) {
        await this.itemMedia.fill(Media)
    }
    async Feedback(data) {
        await this.feedback.fill(data)
    }
}

