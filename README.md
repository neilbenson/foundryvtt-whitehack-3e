# Whitehack 3e system (unofficial) for FoundryVTT

This system provides support for the [Whitehack RPG 3rd edition](https://whitehackrpg.wordpress.com/) in [FoundryVTT](https://foundryvtt.com). It is published with the approval of Christian Mehrstam, the creator of the Whitehack RPG.

## Installation

The recommended method of installing the Whitehack 3e system is from within FoundryVTT using the **Install System** option in the **Game Systems** tab. Alternatively you can install it using the manifest [link](https://raw.githubusercontent.com/hellbrandt/foundryvtt-whitehack-3e/main/src/system.json) or download the zip package from the repository's dist folder and install to your FoundryVTT `Data/Systems` folder.

## Usage

This system includes actor sheets for:

- Characters
- Monsters/NPCs

It supports items which can be created in the items panel and dragged onto characters, can be created directly in actors:

- Ability
- Armour
- Gear
- Weapon

Players and GMs can make attribute task checks, saves and attack rolls from actor sheets. Armour Class and Encumbrance are calculated based on Armour, Gear and Weapons (see below). Vocation and Species fields are populated from the Abilities tab and cannot be added directly.

There are compendiums for:

- Armour
- Gear
- Weapons

Which can be dragged directly onto a character or into the items panel.

I have slightly changed the encumbrance system, based on a regular item taking one slot:

- Heavy (2 slots)
- Regular (1 slot)
- Minor (2 per slot)
- Small (5 per slot)
- Negligible (100 per slot)
- Transport (doesn't use character encumbrance slots)

The system supports the FoundryVTT initiative system. After actors have been added to the combat tracker you can roll initiative from there or from the relevant token on a battle map.

Full documentation can be accessed in FoundryVTT in the **Game Settings** tab. They are also available on github pages [here](https://neilbenson.github.io/foundryvtt-whitehack-3e/)

## License

This unofficial system requires Whitehack, &copy;2013&ndash;2021 Christian Mehrstam. You can find it [here](https://whitehackrpg.wordpress.com).

Whitehack is an RPG trademark through established use, owned by Christian Mehrstam. This third party product is unaffiliated. The Whitehack name is used with permission.

## Credits

Thanks to:

- Christian Mehrstam for producing the fantastic Whitehack RPG and giving approval to release this FoundryVTT system.

- [Cédric Hauteville's series on FoundryVTT development](https://www.youtube.com/playlist?list=PLFV9z59nkHDccUbRXVt623UdloPTclIrz) which put me on the right path, highly recommended.

- Chris Sharp for guidance and insight, both in Twitter chats and by referencing his fantastic [Operation Whitebox FoundryVTT system](https://github.com/chrisesharp/foundryvtt-owb/), I highly recommend checking that out.

The background texture for actor and item sheets and dialogs is from https://www.myfreetextures.com/worn-parchment-paper-4/ and is used in accordance with the [My Free Textures Licence/Terms of Use](https://www.myfreetextures.com/use-license/).

## TO DO:

- [ ] Add AC input on Attack Dialog?
- [ ] Setting in Config menu - what to include?

