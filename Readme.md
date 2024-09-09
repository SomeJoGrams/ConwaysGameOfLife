# Conway Game

* A conway game implementation
* A 2d implementation of a conway game. Normally there are 2 states for cells(alive/dead). The basic rules are that living cells with 2 or 3 neighbours will die (overpopulation population). Dead Cells with 3 neighbours(population) will live. Furthermore all other cells will just will die (overpopulation/ underpopulation).
As shorthand notion a conway world, where e.g. the basic rules are applied , can then be written as 23/3.

Some really nice complex shapes can follow from this simple rules already.

## Remaining Ideas/ TODOs

    * Make more config editable
    * Add randomization/movement to 'rule' position
    * Make rule positions relative
    * Prerender updates with mouse positions immediately
    * Split files into view(ConwayFieldDisplayer/CellRepr) / state (ConwayGame)
    * Add music bpm cell evolution(wallpaper engine)
    * Add a config menu (without wallpaper engine)
    * unify coding style, make everything snake case
    * add shorthand notion for rules
    * write some more ui tests
    * remove (unused) code only used for testing typescript functionality
    * make color repr a function