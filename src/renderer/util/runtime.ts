import { ClientConfigurationType, Keys, ThemeConfigurationType, ThemeType } from '@common/config';
import { DeepPartial } from '@common/utils';
import type { ConfigConstType } from '@main/config/const';

export class Runtime {
  static clientConfig: ClientConfigurationType;
  static currentTheme: ThemeType & {
    config: ThemeConfigurationType;
  };

  static constants: ConfigConstType;
  static ready: Promise<void> = new Promise(() => {});
  static themes: ThemeType[];

  static async init() {
    const fullConfig = await window.bridge.callMain('get-configuration');
    Runtime.clientConfig = fullConfig.dynamic;
    Runtime.constants = fullConfig.constants;
    Runtime.themes = fullConfig.themes;
    Runtime.ready = Promise.resolve();
  }

  static async loadTheme(theme: string) {
    const themePath = Runtime.themes.find(t => t.name === theme);
    if (!themePath) {
      return;
    }
    const path = await window.bridge.callMain('path-join', themePath.path, Keys.themeConfiguration);
    const themeConfig = await window.bridge.callMain('request-json-file', path);
    if (Runtime.validateTheme(themeConfig)) {
      Runtime.currentTheme = {
        ...themePath,
        config: themeConfig as ThemeConfigurationType,
      };
    }
  }

  private static validateTheme(theme: unknown): boolean {
    const themeConfig = theme as DeepPartial<ThemeConfigurationType>;
    const missing = [] as string[];
    const invalid = [] as string[];

    if (!themeConfig.main) {
      missing.push('pages');
    } else {
      const pageMissing = [] as string[];
      if (!themeConfig.main.layout) {
        pageMissing.push('layout');
      }
      if (pageMissing.length) {
        invalid.push(`missing field ${pageMissing.join(', ')} in page main`);
      }
    }
    if (missing.length === 0 && invalid.length === 0) {
      return true;
    }

    let error = `Invalid ${Keys.themeConfiguration} file:\n`;
    if (missing.length) {
      error += `\tMissing fields: ${missing.join(', ')}\n`;
    }
    if (invalid.length) {
      error += `\tInvalid fields: \n${invalid.map(i => '\t\t' + i + '\n')}`;
    }

    console.log(error);
    return false;
  }
}
