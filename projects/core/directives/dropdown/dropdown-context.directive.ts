import {Directive, HostListener, inject} from '@angular/core';
import {
    EMPTY_CLIENT_RECT,
    TuiActiveZoneDirective,
    tuiPointToClientRect,
} from '@taiga-ui/cdk';
import {tuiAsDriver, tuiAsRectAccessor, TuiRectAccessor} from '@taiga-ui/core/abstract';
import {shouldCall} from '@tinkoff/ng-event-plugins';

import {TuiDropdownDriver} from './dropdown.driver';

function activeZoneFilter(this: TuiDropdownContextDirective, target: Element): boolean {
    return !this.activeZone.contains(target);
}

@Directive({
    standalone: true,
    selector: '[tuiDropdownContext]',
    providers: [
        TuiActiveZoneDirective,
        TuiDropdownDriver,
        tuiAsDriver(TuiDropdownDriver),
        tuiAsRectAccessor(TuiDropdownContextDirective),
    ],
})
export class TuiDropdownContextDirective extends TuiRectAccessor {
    private readonly driver = inject(TuiDropdownDriver);
    private currentRect = EMPTY_CLIENT_RECT;

    readonly activeZone = inject(TuiActiveZoneDirective);
    readonly type = 'dropdown';

    @HostListener('contextmenu.prevent.stop', ['$event.clientX', '$event.clientY'])
    onContextMenu(x: number, y: number): void {
        this.currentRect = tuiPointToClientRect(x, y);
        this.driver.next(true);
    }

    @shouldCall(activeZoneFilter)
    @HostListener('document:click.silent', ['$event.target'])
    @HostListener('document:contextmenu.capture.silent', ['$event.target'])
    @HostListener('document:keydown.esc', ['$event.currentTarget'])
    closeDropdown(): void {
        this.driver.next(false);
    }

    getClientRect(): DOMRect {
        return this.currentRect;
    }
}
