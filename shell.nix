let
  nixpkgs = import (builtins.fetchTarball "channel:nixos-18.03") {};
in
  nixpkgs.mkShell {
    buildInputs = with nixpkgs; [
      nodejs
      haskellPackages.patat
    ];
  }
