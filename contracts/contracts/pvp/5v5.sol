// pragma solidity >=0.7.6 <0.9.0;

// import {RandomNumberV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/RandomNumberV2Interface.sol";

// contract LotteryWithRandomNumber {
//     RandomNumberV2Interface internal randomNumberGenerator;

//     constructor(address _randomNumberGenerator) {
//         randomNumberGenerator = RandomNumberV2Interface(_randomNumberGenerator);
//     }

//     enum Result { Draw, ArrayA, ArrayB }

//     function compareRandomPicks(uint256[5] memory arrayA, uint256[5] memory arrayB)view 
//         external
//         returns (
//             Result winner,
//             uint256 seed,
//             uint256[3] memory picksA,
//             uint256[3] memory picksB
//         )
//     {
//         (uint256 randomBase, bool isSecure, ) = randomNumberGenerator.getRandomNumber();
//         require(isSecure, "Random number not secure");

//         seed = randomBase;

//         uint256[5] memory indices = [uint256(0), 1, 2, 3, 4];

//         for (uint256 i = 0; i < 3; i++) {
//             uint256 j = i + (uint256(keccak256(abi.encode(seed, "A", i))) % (5 - i));
//             (indices[i], indices[j]) = (indices[j], indices[i]);
//             picksA[i] = arrayA[indices[i]];
//         }

//         indices = [uint256(0), 1, 2, 3, 4];
//         for (uint256 i = 0; i < 3; i++) {
//             uint256 j = i + (uint256(keccak256(abi.encode(seed, "B", i))) % (5 - i));
//             (indices[i], indices[j]) = (indices[j], indices[i]);
//             picksB[i] = arrayB[indices[i]];
//         }

//         uint256 scoreA = 0;
//         uint256 scoreB = 0;

//         for (uint256 i = 0; i < 3; i++) {
//             if (picksA[i] > picksB[i]) scoreA++;
//             else if (picksB[i] > picksA[i]) scoreB++;
//         }

//         if (scoreA > scoreB) {
//             winner = Result.ArrayA;
//         } else if (scoreB > scoreA) {
//             winner = Result.ArrayB;
//         } else {
//             winner = Result.Draw;
//         }

//         return (winner, seed, picksA, picksB);
//     }
// }