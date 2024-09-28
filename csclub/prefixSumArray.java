import java.lang.*;

class PrefixArray {

	public static void main(String[] args) {
		//Given a really long array:

		int[] x = new int[100000]; //Create an array with 100,000 elements

		int n = x.length; //Save array length

		for(int i = 0; i<n; i++){
			x[i] = (int)(Math.random() * 1e6); //Fill each element with random integers from 1 to 1,000,000 (1e6 = 10^6)
		}

		long[] prefixSumArray = makePrefixSumArray(x); //Make a prefix sum array from the normal array
		//Side Note: This uses a long type because adding up too many high numbers could easily exceed the maximum amount for an integer.
		//           Theoretically it could also exceed the maximum for a long type, so in that case use the long long type.
		//           The elements of an array 100,000 elements long would have to average over 10^13 for the sum to exceed
		//           the max value of a long so you probably won't need to use a long long int for this.


		//To test it:
		for(int i = 0; i<1000; i++){ //1000 times:
			int randomStartIndex = (int)(Math.random() * n); //Choose a random start index
			int randomEndIndex = randomStartIndex+(int)(Math.random() * (n - randomStartIndex)); //Choose a random end index after the random start index

			//if the start index is 0, then just return the sum of the array up to the end index (prefixSumArray[randomEndIndex]).
			//Otherwise, subtract the sum of everything before the start index (prefixSumArray[randomStartIndex - 1]).
			long rangeSum = prefixSumArray[randomEndIndex]; 
			if(randomStartIndex != 0){
				rangeSum -= prefixSumArray[randomStartIndex - 1];
			}
			//Print result:
			System.out.println("Start Index: "+randomStartIndex+" End Index: "+randomEndIndex+" Sum: "+rangeSum);

		}

		//On average, you'd have had to have added up 50,000,000 different numbers with this size of array. Here, it's only 2,000 additions!


	}
	public static long[] makePrefixSumArray(int[] normalArray){
		long[] prefixSumArray = new long[normalArray.length]; //Create the array
		long totalSum = 0; //Save a temporary variable to save the sum of everything up to this point

		for(int i = 0; i<normalArray.length; i++){
			totalSum += normalArray[i]; //Update the sum to include the current element of the normal array too
			prefixSumArray[i] = totalSum; //Make the current element of the prefix sum array the total sum up to this point
		}

		return prefixSumArray; //Return the prefix sum array
	}
}