import { GameObjects } from "phaser";

/************************************************************
 * Theme config
 ***********************************************************/
export class Theme{
    name               = 'iOSLight';

    // color
    primaryColor       = 0x007bff;
    secondaryColor     = 0x7633d4;
    successColor       = 0x28a745;
    infoColor          = 0x17a2b8;
    warnColor          = 0xffc107;
    dangerColor        = 0xdc3545;

    // background
    bgColor            = 0xffffff;
    bgDarkColor        = 0x343a40;
    bgLightColor       = 0xf8f9fa;

    // text
    textColor          = 0x000000; // black;
    textLightColor     = 0xffffff;
    textFont           = 'Arial';
    textSize           = 16;
    textSmallSize      = 12;

    // border
    borderColor        = 0xcdcdcd;
    borderWidth        = 1;
    borderRadius       = 8;

    // link
    linkColor          = 0x0000ff;
    linkHoverColor     = 0x1010ff;
    linkVisitedColor   = 0xa0a0a0;

    // size
    rowHeight          = 48;
    controlHeight      = 40;
    controlWidth       = 120;


    constructor(opt: any) {
        Object.assign(this, opt);
    }
}


/********************************************************************
 * Set theme interface for control.
 *******************************************************************/
export interface ITheme{
    setTheme(theme: Theme): void;
}

/*******************************************************************
 * Theme manager
 * @example ThemeManager.setTheme(scene, ThemeManager.themeLight);
 *******************************************************************/
export class ThemeManager{
    /** Theme light*/
    public static themeLight = new Theme({
        name             : 'iOSLight',
        textColor        : 0x000000,
        textLightColor   : 0xffffff,
        bgColor          : 0xffffff,
        linkColor        : 0x0000ff,
        linkHoverColor   : 0x1010ff,
        linkVisitedColor : 0xa0a0a0,
        primaryColor     : 0x007bff,
        secondaryColor   : 0x7633d4,
        successColor     : 0x28a745,
        infoColor        : 0x17a2b8,
        warnColor        : 0xffc107,
        dangerColor      : 0xdc3545,
        bgDarkColor      : 0x343a40,
        bgLightColor     : 0xf8f9fa,
        borderColor      : 0xcdcdcd,
        borderWidth      : 1,
        borderRadius     : 8
    });

    /** Theme dark */
    static themeDark = new Theme({
        name             : 'MaterialDark',
        textColor        : 0xcccccc,
        textLightColor   : 0xf0f0f0,
        bgColor          : 0x171717,
        linkColor        : 0xff0000,
        linkHoverColor   : 0x00ff00,
        linkVisitedColor : 0xa0a0a0,
        primaryColor     : 0x007bff,
        secondaryColor   : 0x7633d4,
        successColor     : 0x28a745,
        infoColor        : 0x17a2b8,
        warnColor        : 0xffc107,
        dangerColor      : 0xdc3545,
        bgDarkColor      : 0x343a40,
        bgLightColor     : 0xf8f9fa,
        borderColor      : 0x707070,
        borderWidth      : 1,
        borderRadius     : 8
    });

    /** Global Theme*/
    static current = ThemeManager.themeLight;


    /**
     * Set page theme.
     * @param {Theme} theme 
     */
    static setTheme(scene: Phaser.Scene, theme: Theme | null = null){
        if (theme != null)
            this.current = theme;

        var eles = scene.children.list;
        eles.forEach(ele => {
            this.setBaseTheme(ele);
            if ((ele as any).setTheme != undefined)
              (ele as any).setTheme(theme);        
        });
    }

    /**
     * Set theme for background and text color. Other settings will be setted in child class.
     */
    static setBaseTheme(ele: any, themeCls: string | null = null){
        if (themeCls == null && ele.themeCls != null)
            themeCls = ele.themeCls;
        if (themeCls == null)
            return;

        var t = ThemeManager.current;
        switch (themeCls){
            case "bg":        ele.fillColor = t.bgColor;          break;
            case "primary":   ele.fillColor = t.primaryColor;     break;
            case "secondary": ele.fillColor = t.secondaryColor;   break;
            case "success":   ele.fillColor = t.successColor;     break;
            case "info":      ele.fillColor = t.infoColor;        break;
            case "warning":   ele.fillColor = t.warnColor;        break;
            case "danger":    ele.fillColor = t.dangerColor;      break;
            default:          ele.fillColor = t.bgColor;          break;
        }
        return ele;
    }
}