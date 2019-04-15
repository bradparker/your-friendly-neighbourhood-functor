let
  nixpkgs = import <nixpkgs> {};
in
  nixpkgs.stdenv.mkDerivation {
    name = "your-friendly-neighbourhood-functor";
    buildInputs = with nixpkgs; [
      nodejs-11_13_0
      haskellPackages.patat
    ];
  }
